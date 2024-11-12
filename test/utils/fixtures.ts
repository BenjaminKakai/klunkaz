import { ethers } from "hardhat";
import { Contract } from "ethers";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

export interface TestBike {
    details: {
        bikeBrand: string;
        bikeTitle: string;
        bikeSize: string;
        bikeColor: string;
        bikeFrame: string;
        bikeFork: string;
        bikeShock: string;
    };
    metadata: {
        category: string;
        images: string;
        bikeAddress: string;
        bikeFeatures: string;
        isStolen: boolean;
        isInsured: boolean;
    };
}

export interface Fixtures {
    contract: Contract;
    owner: SignerWithAddress;
    seller: SignerWithAddress;
    buyer: SignerWithAddress;
    reviewer: SignerWithAddress;
    sampleBike: TestBike;
}

export async function deployFixture(): Promise<Fixtures> {
    const [owner, seller, buyer, reviewer] = await ethers.getSigners();
    
    const Klunkaz = await ethers.getContractFactory("Klunkaz");
    const contract = await Klunkaz.deploy();
    
    const sampleBike: TestBike = {
        details: {
            bikeBrand: "Trek",
            bikeTitle: "Mountain Explorer",
            bikeSize: "Large",
            bikeColor: "Blue",
            bikeFrame: "Carbon",
            bikeFork: "RockShox",
            bikeShock: "Fox"
        },
        metadata: {
            category: "Mountain",
            images: "ipfs://QmTest",
            bikeAddress: "123 Bike Street",
            bikeFeatures: "Disc brakes",
            isStolen: false,
            isInsured: false
        }
    };

    return {
        contract,
        owner,
        seller,
        buyer,
        reviewer,
        sampleBike
    };
}