// Types.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

library Types {
    enum ListingType { Sale, Rental }
    enum TransactionType { Purchase, Rental, RentalEnd, ListingUpdate, StatusUpdate }
    enum TransactionStatus { Pending, Completed, Cancelled, Disputed }
    enum BikeCondition { New, Excellent, Good, Fair, Poor }
    enum RentalDuration { Daily, Weekly, Monthly }

    struct UserProfile {
        string name;
        string email;
        string location;
        string bio;
        uint256 totalTransactions;
        uint256 rating;
        bool isVerified;
        mapping(address => bool) followers;
        uint256 followerCount;
        bool isBlacklisted;
        uint256 lastUpdateTime;
    }

    struct Transaction {
        uint256 transactionId;
        uint256 bikeId;
        TransactionType transactionType;
        TransactionStatus status;
        address from;
        address to;
        uint256 amount;
        uint256 timestamp;
        string details;
        bool isRefunded;
        string disputeReason;
    }

    struct BikeDetails {
        string bikeBrand;
        string bikeTitle;
        string bikeSize;
        string bikeColor;
        string bikeFrame;
        string bikeFork;
        string bikeShock;
        BikeCondition condition;
        uint256 manufactureYear;
        uint256 lastServiceDate;
        string serialNumber;
        bool hasWarranty;
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
        uint256 securityDeposit;
        uint256[] maintenanceHistory;
        bool requiresVerification;
        RentalDuration preferredRentalDuration;
        uint256 insuranceExpiryDate;
        string[] modifications;
        uint256 totalRentals;
    }

    struct Bike {
        uint256 productID;
        address owner;
        uint256 price;
        BikeDetails details;
        BikeMetadata metadata;
        address[] reviewers;
        string[] reviews;
        uint256 createdAt;
        uint256 lastUpdated;
        uint256 viewCount;
    }

    struct Review {
        address reviewer;
        uint256 productId;
        uint256 rating;
        string comment;
        uint256 likes;
        uint256 timestamp;
        bool isVerifiedPurchase;
        string[] images;
        uint256[] helpfulVotes;
    }

    struct Product {
        uint256 productId;
        uint256 totalRating;
        uint256 numReviews;
        uint256 totalSales;
        mapping(uint256 => uint256) monthlyViews;
        bool isDeleted;
    }

    struct RentalAgreement {
        uint256 bikeId;
        address renter;
        uint256 startDate;
        uint256 endDate;
        uint256 deposit;
        bool depositReturned;
        string[] conditions;
        bool signed;
    }
}