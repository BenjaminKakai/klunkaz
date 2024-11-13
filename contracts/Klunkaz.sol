// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Klunkaz is ERC721, ReentrancyGuard, Ownable {
    // Constants
    uint256 private constant COMMISSION_RATE = 25; // 2.5%
    uint256 private constant COMMISSION_DENOMINATOR = 1000;

    enum ListingType { Sale, Rental }

    struct BikeDetails {
        string bikeBrand;
        string bikeTitle;
        string bikeSize;
        string bikeColor;
        string bikeFrame;
        string bikeFork;
        string bikeShock;
    }

    struct BikeMetadata {
        string category;
        string images;
        string bikeAddress;
        string bikeFeatures;
        bool isStolen;
        bool isInsured;
        ListingType listingType;
        uint256 rentalPrice;
        bool isRented;
        address currentRenter;
        uint256 rentalEndTime;
    }

    struct Bike {
        uint256 productID;
        address owner;
        uint256 price;
        BikeDetails details;
        BikeMetadata metadata;
        address[] reviewers;
        string[] reviews;
    }

    struct Review {
        address reviewer;
        uint256 productId;
        uint256 rating;
        string comment;
        uint256 likes;
        uint256 timestamp;
    }

    struct Product {
        uint256 productId;
        uint256 totalRating;
        uint256 numReviews;
    }

    // State variables
    mapping(uint256 => Bike) private bikes;
    mapping(uint256 => Review[]) private reviews;
    mapping(address => uint256[]) private userReviews;
    mapping(uint256 => Product) private products;
    mapping(uint256 => address) private bikeTrackers;
    mapping(uint256 => mapping(uint256 => mapping(address => bool))) private reviewLikes;
    mapping(uint256 => mapping(address => uint256[])) private rentalHistory;

    uint256 public bikeIndex;
    uint256 public reviewsCounter;

    // Events
    event BikeListed(uint256 indexed id, address indexed owner, uint256 price);
    event BikeSold(uint256 indexed id, address indexed oldOwner, address indexed newOwner, uint256 price);
    event BikeResold(uint256 indexed id, address indexed oldOwner, address indexed newOwner, uint256 price);
    event BikeStatusUpdated(uint256 indexed id, bool isStolen);
    event BikeInsuranceUpdated(uint256 indexed id, bool isInsured);
    event ReviewAdded(uint256 indexed productId, address indexed reviewer, uint256 rating, string comment);
    event ReviewLiked(uint256 indexed productId, uint256 indexed reviewIndex, address indexed liker, uint256 likes);
    event TrackerRegistered(uint256 indexed bikeId, address indexed deviceAddress);
    event PriceUpdated(uint256 indexed bikeId, uint256 newPrice);
    event ReviewDeleted(uint256 indexed productId, uint256 indexed reviewIndex);
    event BikeRented(uint256 indexed bikeId, address indexed renter, uint256 duration, uint256 totalPrice);
    event RentalEnded(uint256 indexed bikeId, address indexed renter);
    event ListingTypeUpdated(uint256 indexed bikeId, ListingType listingType);
    event RentalPriceUpdated(uint256 indexed bikeId, uint256 newPrice);

    constructor() ERC721("Klunkaz", "KLNK") {}

    function listBike(
        uint256 price,
        BikeDetails calldata details,
        BikeMetadata calldata metadata,
        ListingType listingType,
        uint256 rentalPrice
    ) external returns (uint256) {
        require(price > 0, "Price must be greater than 0");
        if (listingType == ListingType.Rental) {
            require(rentalPrice > 0, "Rental price must be greater than 0");
        }

        uint256 productId = ++bikeIndex;
        Bike storage bike = bikes[productId];

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

        _mint(msg.sender, productId);
        emit BikeListed(productId, msg.sender, price);
        emit ListingTypeUpdated(productId, listingType);

        return productId;
    }

    function rentBike(uint256 bikeId, uint256 durationInDays) external payable nonReentrant {
        require(bikes[bikeId].metadata.listingType == ListingType.Rental, "Bike not available for rent");
        require(!bikes[bikeId].metadata.isRented, "Bike is currently rented");
        require(!bikes[bikeId].metadata.isStolen, "Bike is marked as stolen");
        
        uint256 totalPrice = bikes[bikeId].metadata.rentalPrice * durationInDays;
        require(msg.value >= totalPrice, "Insufficient payment");

        bikes[bikeId].metadata.isRented = true;
        bikes[bikeId].metadata.currentRenter = msg.sender;
        bikes[bikeId].metadata.rentalEndTime = block.timestamp + (durationInDays * 1 days);

        rentalHistory[bikeId][msg.sender].push(block.timestamp);

        address payable owner = payable(bikes[bikeId].owner);
        owner.transfer(totalPrice);

        emit BikeRented(bikeId, msg.sender, durationInDays, totalPrice);
    }

    function endRental(uint256 bikeId) external {
        require(bikes[bikeId].metadata.isRented, "Bike is not rented");
        require(
            msg.sender == bikes[bikeId].owner || 
            msg.sender == bikes[bikeId].metadata.currentRenter,
            "Not authorized"
        );
        require(block.timestamp >= bikes[bikeId].metadata.rentalEndTime, "Rental period not ended");

        bikes[bikeId].metadata.isRented = false;
        bikes[bikeId].metadata.currentRenter = address(0);
        bikes[bikeId].metadata.rentalEndTime = 0;

        emit RentalEnded(bikeId, bikes[bikeId].metadata.currentRenter);
    }

    function markAsStolen(uint256 bikeId) external {
        require(ownerOf(bikeId) == msg.sender, "Not the bike owner");
        bikes[bikeId].metadata.isStolen = true;
        emit BikeStatusUpdated(bikeId, true);
    }

    function unflagBikeAsStolen(uint256 bikeId) external {
        require(ownerOf(bikeId) == msg.sender, "Not the bike owner");
        require(bikes[bikeId].metadata.isStolen, "Bike is not marked as stolen");
        bikes[bikeId].metadata.isStolen = false;
        emit BikeStatusUpdated(bikeId, false);
    }

    function registerTracker(uint256 bikeId, address deviceAddress) external {
        require(ownerOf(bikeId) == msg.sender, "Not the bike owner");
        bikeTrackers[bikeId] = deviceAddress;
        emit TrackerRegistered(bikeId, deviceAddress);
    }

    function insureBike(uint256 bikeId) external payable {
        require(ownerOf(bikeId) == msg.sender, "Not the bike owner");
        require(!bikes[bikeId].metadata.isInsured, "Bike is already insured");
        bikes[bikeId].metadata.isInsured = true;
        emit BikeInsuranceUpdated(bikeId, true);
    }

    function _transfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override {
        require(!bikes[tokenId].metadata.isRented, "Cannot transfer while rented");
        super._transfer(from, to, tokenId);
        bikes[tokenId].owner = to;
        emit BikeResold(tokenId, from, to, bikes[tokenId].price);
    }

    function addReview(uint256 productId, uint256 rating, string memory comment) external {
        require(rating >= 1 && rating <= 5, "Rating must be between 1 and 5");
        require(bytes(comment).length > 0, "Comment cannot be empty");

        Review memory newReview = Review({
            reviewer: msg.sender,
            productId: productId,
            rating: rating,
            comment: comment,
            likes: 0,
            timestamp: block.timestamp
        });

        reviews[productId].push(newReview);
        userReviews[msg.sender].push(productId);

        Product storage product = products[productId];
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

    function updateListingType(uint256 bikeId, ListingType newListingType, uint256 rentalPrice) external {
        require(ownerOf(bikeId) == msg.sender, "Not the bike owner");
        require(!bikes[bikeId].metadata.isRented, "Cannot change type while rented");
        
        if (newListingType == ListingType.Rental) {
            require(rentalPrice > 0, "Rental price must be greater than 0");
            bikes[bikeId].metadata.rentalPrice = rentalPrice;
        }
        
        bikes[bikeId].metadata.listingType = newListingType;
        emit ListingTypeUpdated(bikeId, newListingType);
    }

    function updateRentalPrice(uint256 bikeId, uint256 newPrice) external {
        require(ownerOf(bikeId) == msg.sender, "Not the bike owner");
        require(bikes[bikeId].metadata.listingType == ListingType.Rental, "Not a rental listing");
        require(newPrice > 0, "Price must be greater than 0");
        require(!bikes[bikeId].metadata.isRented, "Cannot update price while rented");

        bikes[bikeId].metadata.rentalPrice = newPrice;
        emit RentalPriceUpdated(bikeId, newPrice);
    }

    function getAllBikes() external view returns (Bike[] memory) {
        Bike[] memory allBikes = new Bike[](bikeIndex);
        for (uint256 i = 1; i <= bikeIndex; i++) {
            allBikes[i-1] = bikes[i];
        }
        return allBikes;
    }

    function getBike(uint256 id) external view returns (Bike memory) {
        return bikes[id];
    }

    function getProductReviews(uint256 productId) external view returns (Review[] memory) {
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

    function getHighestRatedProduct() external view returns (uint256) {
        uint256 highestRating = 0;
        uint256 highestRatedProduct = 0;

        for (uint256 i = 1; i <= bikeIndex; i++) {
            Product storage product = products[i];
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

    function getBikeDetails(uint256 bikeId) external view returns (BikeDetails memory) {
        return bikes[bikeId].details;
    }

    function getBikeMetadata(uint256 bikeId) external view returns (BikeMetadata memory) {
        return bikes[bikeId].metadata;
    }

    function updatePrice(uint256 bikeId, uint256 newPrice) external {
        require(ownerOf(bikeId) == msg.sender, "Not the bike owner");
        require(newPrice > 0, "Price must be greater than 0");
        require(!bikes[bikeId].metadata.isRented, "Cannot update price while rented");

        bikes[bikeId].price = newPrice;
        emit PriceUpdated(bikeId, newPrice);
    }

    function deleteReview(uint256 productId, uint256 reviewIndex) external {
        require(reviewIndex < reviews[productId].length, "Review does not exist");
        require(reviews[productId][reviewIndex].reviewer == msg.sender, "You can only delete your own reviews");

        // Update the product's rating and number of reviews before deleting
        Product storage product = products[productId];
        product.totalRating -= reviews[productId][reviewIndex].rating;
        product.numReviews--;

        // Delete the review by shifting elements
        for (uint256 i = reviewIndex; i < reviews[productId].length - 1; i++) {
            reviews[productId][i] = reviews[productId][i + 1];
        }
        reviews[productId].pop();

        emit ReviewDeleted(productId, reviewIndex);
    }
}