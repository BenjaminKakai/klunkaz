// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

library BikeLib {
    struct BikeValidation {
        bool exists;
        bool isStolen;
        bool isInsured;
    }

    event BikeValidated(uint256 indexed bikeId, bool isValid);
    
    function validateBikeDetails(
        string memory brand,
        string memory title,
        string memory size
    ) internal pure returns (bool) {
        return (
            bytes(brand).length > 0 &&
            bytes(title).length > 0 &&
            bytes(size).length > 0
        );
    }

    function calculateInsuranceRate(
        uint256 bikePrice,
        uint256 ageInMonths
    ) internal pure returns (uint256) {
        require(bikePrice > 0, "Invalid bike price");
        uint256 baseRate = (bikePrice * 5) / 100; // 5% base rate
        
        if (ageInMonths > 24) {
            baseRate = (baseRate * 120) / 100; // 20% increase for bikes over 2 years
        }
        
        return baseRate;
    }

    function getLocationHash(
        string memory bikeAddress
    ) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(bikeAddress));
    }
}