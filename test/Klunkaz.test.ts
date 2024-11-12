import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("Klunkaz", function () {
    let klunkazContract: Contract;
    let owner: HardhatEthersSigner;
    let addr1: HardhatEthersSigner;
    let addr2: HardhatEthersSigner;

    const sampleBikeDetails = {
        bikeBrand: "Trek",
        bikeTitle: "Mountain Explorer",
        bikeSize: "Large",
        bikeColor: "Blue",
        bikeFrame: "Carbon",
        bikeFork: "RockShox",
        bikeShock: "Fox"
    };

    const sampleBikeMetadata = {
        category: "Mountain",
        images: "ipfs://QmTest",
        bikeAddress: "123 Bike Street",
        bikeFeatures: "Disc brakes",
        isStolen: false,
        isInsured: false
    };

    beforeEach(async function () {
        const Klunkaz = await ethers.getContractFactory("Klunkaz");
        [owner, addr1, addr2] = await ethers.getSigners();
        klunkazContract = await Klunkaz.deploy();
        // Remove the .deployed() call as it's not needed in ethers v6
    });

    describe("Bike Listing and Ownership", function () {
        it("Should list a new bike and verify ownership", async function () {
            const price = ethers.parseEther("1.0");
            
            await klunkazContract.connect(addr1).listBike(
                price,
                sampleBikeDetails,
                sampleBikeMetadata
            );

            const bike = await klunkazContract.getBike(1);
            expect(bike.owner).to.equal(await addr1.getAddress());
            expect(bike.price).to.equal(price);
            expect(await klunkazContract.ownerOf(1)).to.equal(await addr1.getAddress());
        });

        it("Should transfer bike ownership through ERC721 transfer", async function () {
            const price = ethers.parseEther("1.0");
            
            await klunkazContract.connect(addr1).listBike(
                price,
                sampleBikeDetails,
                sampleBikeMetadata
            );

            await klunkazContract.connect(addr1).approve(await addr2.getAddress(), 1);
            await klunkazContract.connect(addr2).transferFrom(
                await addr1.getAddress(), 
                await addr2.getAddress(), 
                1
            );

            const bike = await klunkazContract.getBike(1);
            expect(bike.owner).to.equal(await addr2.getAddress());
            expect(await klunkazContract.ownerOf(1)).to.equal(await addr2.getAddress());
        });
    });

    describe("Bike Features", function () {
        beforeEach(async function () {
            await klunkazContract.connect(addr1).listBike(
                ethers.parseEther("1.0"),
                sampleBikeDetails,
                sampleBikeMetadata
            );
        });

        it("Should mark bike as stolen", async function () {
            await klunkazContract.connect(addr1).markAsStolen(1);
            const bike = await klunkazContract.getBike(1);
            expect(bike.metadata.isStolen).to.be.true;
        });

        it("Should register tracker", async function () {
            const trackerAddress = "0x1234567890123456789012345678901234567890";
            await klunkazContract.connect(addr1).registerTracker(1, trackerAddress);
        });

        it("Should insure bike", async function () {
            await klunkazContract.connect(addr1).insureBike(1);
            const bike = await klunkazContract.getBike(1);
            expect(bike.metadata.isInsured).to.be.true;
        });

        it("Should unflag bike as stolen", async function () {
            await klunkazContract.connect(addr1).markAsStolen(1);
            let bike = await klunkazContract.getBike(1);
            expect(bike.metadata.isStolen).to.be.true;

            await klunkazContract.connect(addr1).unflagBikeAsStolen(1);
            bike = await klunkazContract.getBike(1);
            expect(bike.metadata.isStolen).to.be.false;
        });

        it("Should revert when non-owner tries to unflag bike as stolen", async function () {
            await klunkazContract.connect(addr1).markAsStolen(1);
            await expect(
                klunkazContract.connect(addr2).unflagBikeAsStolen(1)
            ).to.be.revertedWith("Not the bike owner");
        });

        it("Should revert when trying to unflag a bike that isn't marked as stolen", async function () {
            await expect(
                klunkazContract.connect(addr1).unflagBikeAsStolen(1)
            ).to.be.revertedWith("Bike is not marked as stolen");
        });
    });
});