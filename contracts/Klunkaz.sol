// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Klunkaz is ERC721, ReentrancyGuard, Ownable {
    // Constants
    uint256 private constant COMMISSION_RATE = 25; // 2.5%
    uint256 private constant COMMISSION_DENOMINATOR = 1000;

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

    constructor() ERC721("Klunkaz", "KLNK") {}

    function listBike(
        uint256 price,
        BikeDetails calldata details,
        BikeMetadata calldata metadata
    ) external returns (uint256) {
        require(price > 0, "Price must be greater than 0");

        uint256 productId = ++bikeIndex;
        Bike storage bike = bikes[productId];

        bike.productID = productId;
        bike.owner = msg.sender;
        bike.price = price;
        bike.details = details;
        bike.metadata = metadata;

        _mint(msg.sender, productId);
        emit BikeListed(productId, msg.sender, price);

        return productId;
    }

    function markAsStolen(uint256 bikeId) external {
        require(ownerOf(bikeId) == msg.sender, "Not the bike owner");
        bikes[bikeId].metadata.isStolen = true;
        emit BikeStatusUpdated(bikeId, true);
    }

    // Add the new unflagBikeAsStolen function
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

    function getBike(uint256 id) external view returns (Bike memory) {
        return bikes[id];
    }

    function getProductReviews(uint256 productId) external view returns (Review[] memory) {
        return reviews[productId];
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

        bikes[bikeId].price = newPrice;
        emit PriceUpdated(bikeId, newPrice);
    }

    function deleteReview(uint256 productId, uint256 reviewIndex) external {
        require(reviewIndex < reviews[productId].length, "Review does not exist");
        require(reviews[productId][reviewIndex].reviewer == msg.sender, "You can only delete your own reviews");

        // Delete the review
        for (uint256 i = reviewIndex; i < reviews[productId].length - 1; i++) {
            reviews[productId][i] = reviews[productId][i + 1];
        }
        reviews[productId].pop();

        // Update the product's rating and number of reviews
        Product storage product = products[productId];
        product.totalRating -= reviews[productId][reviewIndex].rating;
        product.numReviews--;

        emit ReviewDeleted(productId, reviewIndex);
    }
}