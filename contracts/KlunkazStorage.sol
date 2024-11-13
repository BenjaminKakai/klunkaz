// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./Types.sol";

contract KlunkazStorage {
    // State variables
    uint256 public bikeIndex;
    uint256 public reviewsCounter;
    uint256 internal transactionCounter;
    
    // Core mappings
    mapping(uint256 => Types.Bike) internal bikes;
    mapping(uint256 => Types.Review[]) internal reviews;
    mapping(address => uint256[]) internal userReviews;
    mapping(uint256 => Types.Product) internal products;
    mapping(uint256 => address) internal bikeTrackers;
    
    // Complex mappings
    mapping(uint256 => mapping(uint256 => mapping(address => bool))) internal reviewLikes;
    mapping(uint256 => mapping(address => uint256[])) internal rentalHistory;
    mapping(address => Types.UserProfile) internal userProfiles;
    mapping(uint256 => Types.Transaction) internal transactions;
    mapping(address => uint256[]) internal userTransactions;
    
    // Storage getters - changed to virtual to allow overriding
    function getBike(uint256 bikeId) internal virtual view returns (Types.Bike storage) {
        return bikes[bikeId];
    }
    
    function getReviews(uint256 productId) internal virtual view returns (Types.Review[] storage) {
        return reviews[productId];
    }
    
    function getUserProfile(address user) internal virtual view returns (Types.UserProfile storage) {
        return userProfiles[user];
    }
    
    function getProduct(uint256 productId) internal virtual view returns (Types.Product storage) {
        return products[productId];
    }
    
    function getTransaction(uint256 transactionId) internal virtual view returns (Types.Transaction storage) {
        return transactions[transactionId];
    }
    
    // Counter management
    function incrementBikeIndex() internal returns (uint256) {
        return ++bikeIndex;
    }
    
    function incrementReviewsCounter() internal returns (uint256) {
        return ++reviewsCounter;
    }
    
    function incrementTransactionCounter() internal returns (uint256) {
        return ++transactionCounter;
    }
    
    // Array management helpers
    function addUserReview(address user, uint256 productId) internal {
        userReviews[user].push(productId);
    }
    
    function addUserTransaction(address user, uint256 transactionId) internal {
        userTransactions[user].push(transactionId);
    }
    
    function addRentalHistory(uint256 bikeId, address renter, uint256 timestamp) internal {
        rentalHistory[bikeId][renter].push(timestamp);
    }
}