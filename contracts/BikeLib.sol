// BikeLib.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

library BikeLib {
    struct BikeValidation {
        bool exists;
        bool isStolen;
        bool isInsured;
    }

    event BikeValidated(uint256 indexed bikeId, bool isValid);
    event ValidationError(uint256 indexed bikeId, string message);
    event InsuranceCalculated(uint256 indexed bikeId, uint256 rate);
    event LocationUpdated(uint256 indexed bikeId, bytes32 locationHash);

    function validateBikeDetails(
        string memory brand,
        string memory title,
        string memory size,
        uint256 price
    ) internal pure returns (bool) {
        require(bytes(brand).length > 0, "Brand cannot be empty");
        require(bytes(title).length > 0, "Title cannot be empty");
        require(bytes(size).length > 0, "Size cannot be empty");
        require(price > 0, "Price must be greater than 0");
        
        return true;
    }

    function calculateInsuranceRate(
        uint256 bikePrice,
        uint256 ageInMonths,
        bool isHighRiskArea
    ) internal pure returns (uint256) {
        require(bikePrice > 0, "Invalid bike price");
        
        // Base rate is 5% of bike value
        uint256 baseRate = (bikePrice * 5) / 100;
        
        // Age adjustments
        if (ageInMonths > 24) {
            baseRate = (baseRate * 120) / 100; // 20% increase for bikes over 2 years
        }
        if (ageInMonths > 48) {
            baseRate = (baseRate * 140) / 100; // Additional 40% increase for bikes over 4 years
        }
        
        // Location risk adjustment
        if (isHighRiskArea) {
            baseRate = (baseRate * 125) / 100; // 25% increase for high-risk areas
        }
        
        return baseRate;
    }

    function getLocationHash(
        string memory bikeAddress,
        string memory postalCode
    ) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(bikeAddress, postalCode));
    }

    function calculateDepreciation(
        uint256 originalPrice,
        uint256 ageInMonths
    ) internal pure returns (uint256) {
        require(originalPrice > 0, "Invalid original price");
        
        // Monthly depreciation rate starts at 1%
        uint256 monthlyRate = 1;
        uint256 totalDepreciation = 0;
        
        // Calculate cumulative depreciation
        if (ageInMonths <= 12) {
            totalDepreciation = (originalPrice * monthlyRate * ageInMonths) / 100;
        } else {
            // First 12 months
            totalDepreciation = (originalPrice * monthlyRate * 12) / 100;
            
            // Subsequent years at 0.5% per month
            uint256 remainingMonths = ageInMonths - 12;
            totalDepreciation += (originalPrice * 5 * remainingMonths) / 1000;
        }
        
        // Ensure maximum depreciation of 70%
        if (totalDepreciation > (originalPrice * 70) / 100) {
            totalDepreciation = (originalPrice * 70) / 100;
        }
        
        return originalPrice - totalDepreciation;
    }

    function validateRentalPeriod(
        uint256 durationInDays,
        uint256 maxRentalDuration
    ) internal pure returns (bool) {
        require(durationInDays > 0, "Duration must be greater than 0");
        require(durationInDays <= maxRentalDuration, "Duration exceeds maximum allowed");
        return true;
    }

    function calculateRentalDeposit(
        uint256 bikePrice,
        uint256 rentalDuration
    ) internal pure returns (uint256) {
        // Base deposit is 25% of bike value
        uint256 baseDeposit = (bikePrice * 25) / 100;
        
        // Additional deposit for longer rentals
        if (rentalDuration > 7) {
            baseDeposit = (baseDeposit * 150) / 100; // 50% increase for rentals over a week
        }
        if (rentalDuration > 30) {
            baseDeposit = (baseDeposit * 200) / 100; // 100% increase for rentals over a month
        }
        
        return baseDeposit;
    }
}