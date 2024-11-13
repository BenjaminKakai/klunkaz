// KlunkazBase.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./KlunkazStorage.sol";
import "./Types.sol";
import "./BikeLib.sol";

abstract contract KlunkazBase is ERC721, ReentrancyGuard, Ownable, KlunkazStorage {
    // Constants
    uint256 private constant COMMISSION_RATE = 25; // 2.5%
    uint256 private constant COMMISSION_DENOMINATOR = 1000;

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
    event ListingTypeUpdated(uint256 indexed bikeId, Types.ListingType listingType);
    event RentalPriceUpdated(uint256 indexed bikeId, uint256 newPrice);
    event ProfileUpdated(address indexed user, string name, string location);
    event TransactionCreated(
        uint256 indexed transactionId,
        uint256 indexed bikeId,
        Types.TransactionType transactionType,
        address indexed from,
        address to
    );
    event UserVerified(address indexed user);
    event MaintenanceAdded(uint256 indexed bikeId, string details, uint256 timestamp);
    event DisputeRaised(uint256 indexed transactionId, address indexed by, string reason);
    event SecurityDepositUpdated(uint256 indexed bikeId, uint256 amount);

    constructor() ERC721("Klunkaz", "KLNK") {}

    // Base transfer function
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

    // Protected utility functions
    function _createTransaction(
        uint256 bikeId,
        Types.TransactionType transactionType,
        address from,
        address to,
        uint256 amount,
        string memory details
    ) internal returns (uint256) {
        uint256 transactionId = incrementTransactionCounter();
        
        transactions[transactionId] = Types.Transaction({
            transactionId: transactionId,
            bikeId: bikeId,
            transactionType: transactionType,
            status: Types.TransactionStatus.Completed,
            from: from,
            to: to,
            amount: amount,
            timestamp: block.timestamp,
            details: details,
            isRefunded: false,      // Added missing field
            disputeReason: ""       // Added missing field
        });

        addUserTransaction(from, transactionId);
        addUserTransaction(to, transactionId);

        emit TransactionCreated(transactionId, bikeId, transactionType, from, to);
        
        return transactionId;
    }

    function _calculateCommission(uint256 amount) internal pure returns (uint256) {
        return (amount * COMMISSION_RATE) / COMMISSION_DENOMINATOR;
    }

    function _validateBikeOwnership(uint256 bikeId) internal view {
        require(ownerOf(bikeId) == msg.sender, "Not the bike owner");
    }

    function _validateRentalStatus(uint256 bikeId, bool shouldBeRented) internal view {
        require(
            bikes[bikeId].metadata.isRented == shouldBeRented,
            shouldBeRented ? "Bike is not rented" : "Bike is currently rented"
        );
    }

    function _validateRentalParticipant(uint256 bikeId) internal view {
        require(
            msg.sender == bikes[bikeId].owner || 
            msg.sender == bikes[bikeId].metadata.currentRenter,
            "Not authorized"
        );
    }

    function _validateUserVerification(address user) internal view {
        require(userProfiles[user].isVerified, "User not verified");
    }

    function _validateReviewExists(uint256 productId, uint256 reviewIndex) internal view {
        require(reviewIndex < reviews[productId].length, "Review does not exist");
    }

    // Modifiers
    modifier onlyBikeOwner(uint256 bikeId) {
        _validateBikeOwnership(bikeId);
        _;
    }

    modifier notRented(uint256 bikeId) {
        _validateRentalStatus(bikeId, false);
        _;
    }

    modifier onlyRented(uint256 bikeId) {
        _validateRentalStatus(bikeId, true);
        _;
    }

    modifier onlyRentalParticipant(uint256 bikeId) {
        _validateRentalParticipant(bikeId);
        _;
    }

    modifier verifiedUserRequired(uint256 bikeId) {
        if (bikes[bikeId].metadata.requiresVerification) {
            _validateUserVerification(msg.sender);
        }
        _;
    }
}
