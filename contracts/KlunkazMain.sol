// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./KlunkazBase.sol";
import "./Types.sol";

contract KlunkazMain is KlunkazBase {
    function getBike(uint256 bikeId) internal view virtual override returns (Types.Bike storage) {
        return super.getBike(bikeId);
    }

    function getBikeView(uint256 id) external view returns (Types.Bike memory) {
        return getBike(id);
    }

    function listBike(
        uint256 price,
        Types.BikeDetails calldata details,
        Types.BikeMetadata calldata metadata,
        Types.ListingType listingType,
        uint256 rentalPrice
    ) external returns (uint256) {
        require(price > 0, "Price must be greater than 0");
        if (listingType == Types.ListingType.Rental) {
            require(rentalPrice > 0, "Rental price must be greater than 0");
        }

        uint256 productId = incrementBikeIndex();
        Types.Bike storage bike = bikes[productId];

        bike.productID = productId;
        bike.owner = msg.sender;
        bike.price = price;
        bike.details = details;
        bike.metadata = metadata;
        bike.metadata.listingType = listingType;
        bike.metadata.rentalPrice = rentalPrice;
        bike.metadata.isRented = false;
        bike.metadata.currentRenter = address(0);
        bike.metadata.rentalEndTime = 0;

        emit BikeListed(productId, msg.sender, price);
        emit ListingTypeUpdated(productId, listingType);

        return productId;
    }

   function rentBike(uint256 bikeId, uint256 durationInDays) external payable nonReentrant {
    Types.Bike storage bike = getBike(bikeId);
    require(bike.metadata.listingType == Types.ListingType.Rental, "Not for rent");
    require(!bike.metadata.isRented, "Currently rented");
    require(!bike.metadata.isStolen, "Marked as stolen");

    if (bike.metadata.requiresVerification) {
        require(userProfiles[msg.sender].isVerified, "User not verified");
    }

    uint256 totalPrice = bike.metadata.rentalPrice * durationInDays;
    uint256 securityDeposit = bike.metadata.securityDeposit;
    require(msg.value >= totalPrice + securityDeposit, "Insufficient payment");

    uint256 transactionId = ++transactionCounter;
    transactions[transactionId] = Types.Transaction({
        transactionId: transactionId,
        bikeId: bikeId,
        transactionType: Types.TransactionType.Rental,
        status: Types.TransactionStatus.Completed,
        from: msg.sender,
        to: bike.owner,
        amount: totalPrice,
        timestamp: block.timestamp,
        details: "Bike rental",
        isRefunded: false,      // Added missing field
        disputeReason: ""       // Added missing field
    });

    userTransactions[msg.sender].push(transactionId);
    userTransactions[bike.owner].push(transactionId);

    bike.metadata.isRented = true;
    bike.metadata.currentRenter = msg.sender;
    bike.metadata.rentalEndTime = block.timestamp + (durationInDays * 1 days);

    rentalHistory[bikeId][msg.sender].push(block.timestamp);

    payable(bike.owner).transfer(totalPrice);

    emit BikeRented(bikeId, msg.sender, durationInDays, totalPrice);
    emit TransactionCreated(transactionId, bikeId, Types.TransactionType.Rental, msg.sender, bike.owner);
}


    function endRental(uint256 bikeId) external {
        Types.Bike storage bike = getBike(bikeId);
        require(bike.metadata.isRented, "Bike is not rented");
        require(
            msg.sender == bike.owner || 
            msg.sender == bike.metadata.currentRenter,
            "Not authorized"
        );
        require(block.timestamp >= bike.metadata.rentalEndTime, "Rental period not ended");

        bike.metadata.isRented = false;
        bike.metadata.currentRenter = address(0);
        bike.metadata.rentalEndTime = 0;

        emit RentalEnded(bikeId, bike.metadata.currentRenter);
    }

    function updateProfile(
        string memory name,
        string memory email,
        string memory location,
        string memory bio
    ) external {
        Types.UserProfile storage profile = userProfiles[msg.sender];
        profile.name = name;
        profile.email = email;
        profile.location = location;
        profile.bio = bio;
        emit ProfileUpdated(msg.sender, name, location);
    }

    function verifyUser(address user) external onlyOwner {
        userProfiles[user].isVerified = true;
        emit UserVerified(user);
    }

    function addMaintenance(uint256 bikeId, string memory details) external {
        Types.Bike storage bike = getBike(bikeId);
        require(bike.owner == msg.sender, "Not the bike owner");
        bike.metadata.maintenanceHistory.push(block.timestamp);
        emit MaintenanceAdded(bikeId, details, block.timestamp);
    }

    function updateSecurityDeposit(uint256 bikeId, uint256 amount) external {
        Types.Bike storage bike = getBike(bikeId);
        require(bike.owner == msg.sender, "Not the bike owner");
        bike.metadata.securityDeposit = amount;
        emit SecurityDepositUpdated(bikeId, amount);
    }

    function raiseDispute(uint256 transactionId, string memory reason) external {
        Types.Transaction storage txn = transactions[transactionId];
        require(msg.sender == txn.from || msg.sender == txn.to, "Not involved in transaction");
        require(txn.status == Types.TransactionStatus.Completed, "Transaction not completed");
        txn.status = Types.TransactionStatus.Disputed;
        emit DisputeRaised(transactionId, msg.sender, reason);
    }

    function markAsStolen(uint256 bikeId) external {
        Types.Bike storage bike = getBike(bikeId);
        require(bike.owner == msg.sender, "Not the bike owner");
        bike.metadata.isStolen = true;
        emit BikeStatusUpdated(bikeId, true);
    }

    function unflagBikeAsStolen(uint256 bikeId) external {
        Types.Bike storage bike = getBike(bikeId);
        require(bike.owner == msg.sender, "Not the bike owner");
        require(bike.metadata.isStolen, "Bike is not marked as stolen");
        bike.metadata.isStolen = false;
        emit BikeStatusUpdated(bikeId, false);
    }

    function registerTracker(uint256 bikeId, address deviceAddress) external {
        Types.Bike storage bike = getBike(bikeId);
        require(bike.owner == msg.sender, "Not the bike owner");
        bikeTrackers[bikeId] = deviceAddress;
        emit TrackerRegistered(bikeId, deviceAddress);
    }

    function insureBike(uint256 bikeId) external payable {
        Types.Bike storage bike = getBike(bikeId);
        require(bike.owner == msg.sender, "Not the bike owner");
        require(!bike.metadata.isInsured, "Bike is already insured");
        bike.metadata.isInsured = true;
        emit BikeInsuranceUpdated(bikeId, true);
    }

   
   function addReview(uint256 productId, uint256 rating, string memory comment) external {
    require(rating >= 1 && rating <= 5, "Rating must be between 1 and 5");
    require(bytes(comment).length > 0, "Comment cannot be empty");

    Types.Review memory newReview = Types.Review({
        reviewer: msg.sender,
        productId: productId,
        rating: rating,
        comment: comment,
        likes: 0,
        timestamp: block.timestamp,
        isVerifiedPurchase: false,
        images: new string[](0),
        helpfulVotes: new uint256[](0)  // Initialize as empty uint256 array
    });

    reviews[productId].push(newReview);
    userReviews[msg.sender].push(productId);

    Types.Product storage product = products[productId];
    product.totalRating += rating;
    product.numReviews++;

    emit ReviewAdded(productId, msg.sender, rating, comment);
}

    function likeReview(uint256 productId, uint256 reviewIndex) external {
        require(reviewIndex < reviews[productId].length, "Review does not exist");
        require(!reviewLikes[productId][reviewIndex][msg.sender], "Already liked this review");

        reviews[productId][reviewIndex].likes++;
        reviewLikes[productId][reviewIndex][msg.sender] = true;

        emit ReviewLiked(productId, reviewIndex, msg.sender, reviews[productId][reviewIndex].likes);
    }

    function updateListingType(uint256 bikeId, Types.ListingType newListingType, uint256 rentalPrice) external {
        Types.Bike storage bike = getBike(bikeId);
        require(bike.owner == msg.sender, "Not the bike owner");
        require(!bike.metadata.isRented, "Cannot change type while rented");
        
        if (newListingType == Types.ListingType.Rental) {
            require(rentalPrice > 0, "Rental price must be greater than 0");
            bike.metadata.rentalPrice = rentalPrice;
        }
        
        bike.metadata.listingType = newListingType;
        emit ListingTypeUpdated(bikeId, newListingType);
    }

    function updateRentalPrice(uint256 bikeId, uint256 newPrice) external {
        Types.Bike storage bike = getBike(bikeId);
        require(bike.owner == msg.sender, "Not the bike owner");
        require(bike.metadata.listingType == Types.ListingType.Rental, "Not a rental listing");
        require(newPrice > 0, "Price must be greater than 0");
        require(!bike.metadata.isRented, "Cannot update price while rented");

        bike.metadata.rentalPrice = newPrice;
        emit RentalPriceUpdated(bikeId, newPrice);
    }

    function updatePrice(uint256 bikeId, uint256 newPrice) external {
        Types.Bike storage bike = getBike(bikeId);
        require(bike.owner == msg.sender, "Not the bike owner");
        require(newPrice > 0, "Price must be greater than 0");
        require(!bike.metadata.isRented, "Cannot update price while rented");

        bike.price = newPrice;
        emit PriceUpdated(bikeId, newPrice);
    }

    function deleteReview(uint256 productId, uint256 reviewIndex) external {
        require(reviewIndex < reviews[productId].length, "Review does not exist");
        require(reviews[productId][reviewIndex].reviewer == msg.sender, "You can only delete your own reviews");

        Types.Product storage product = products[productId];
        product.totalRating -= reviews[productId][reviewIndex].rating;
        product.numReviews--;

        for (uint256 i = reviewIndex; i < reviews[productId].length - 1; i++) {
            reviews[productId][i] = reviews[productId][i + 1];
        }
        reviews[productId].pop();

        emit ReviewDeleted(productId, reviewIndex);
    }

    function getAllBikes() external view returns (Types.Bike[] memory) {
        Types.Bike[] memory allBikes = new Types.Bike[](bikeIndex);
        for (uint256 i = 1; i <= bikeIndex; i++) {
            allBikes[i-1] = getBike(i);
        }
        return allBikes;
    }

    function getProductReviews(uint256 productId) external view returns (Types.Review[] memory) {
        return reviews[productId];
    }

    function getRentalHistory(uint256 bikeId, address renter) external view returns (uint256[] memory) {
        return rentalHistory[bikeId][renter];
    }

    function hasLikedReview(uint256 productId, uint256 reviewIndex, address user) external view returns (bool) {
        return reviewLikes[productId][reviewIndex][user];
    }

    function getUserReviews(address user) external view returns (uint256[] memory) {
        return userReviews[user];
    }

    function getUserTransactions(address user) external view returns (Types.Transaction[] memory) {
        uint256[] storage txnIds = userTransactions[user];
        Types.Transaction[] memory userTxns = new Types.Transaction[](txnIds.length);
        
        for (uint256 i = 0; i < txnIds.length; i++) {
            userTxns[i] = transactions[txnIds[i]];
        }
        
        return userTxns;
    }

    function getHighestRatedProduct() external view returns (uint256) {
        uint256 highestRating = 0;
        uint256 highestRatedProduct = 0;

        for (uint256 i = 1; i <= bikeIndex; i++) {
            Types.Product storage product = products[i];
            if (product.numReviews > 0) {
                uint256 avgRating = product.totalRating / product.numReviews;
                if (avgRating > highestRating) {
                    highestRating = avgRating;
                    highestRatedProduct = i;
                }
            }
        }

        return highestRatedProduct;
    }

    function getBikeDetails(uint256 bikeId) external view returns (Types.BikeDetails memory) {
        return getBike(bikeId).details;
    }

    function getBikeMetadata(uint256 bikeId) external view returns (Types.BikeMetadata memory) {
        return getBike(bikeId).metadata;
    }
}