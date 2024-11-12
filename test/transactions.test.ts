import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("Klunkaz Transactions", function () {
    let klunkazContract: Contract;
    let owner: SignerWithAddress;
    let seller: SignerWithAddress;
    let buyer: SignerWithAddress;

    const sampleBike = {
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

    async function deployTransactionFixture() {
        const Klunkaz = await ethers.getContractFactory("Klunkaz");
        const [owner, seller, buyer] = await ethers.getSigners();
        const klunkaz = await Klunkaz.deploy();
        
        return { klunkaz, owner, seller, buyer };
    }

    beforeEach(async function () {
        const { klunkaz, owner: _owner, seller: _seller, buyer: _buyer } = await loadFixture(deployTransactionFixture);
        klunkazContract = klunkaz;
        owner = _owner;
        seller = _seller;
        buyer = _buyer;
    });

    describe("Bike Transactions", function () {
        it("Should list and transfer bike ownership", async function () {
            const price = ethers.parseEther("1.0");
            
            await klunkazContract.connect(seller).listBike(
                price,
                sampleBike.details,
                sampleBike.metadata
            );

            await klunkazContract.connect(seller).approve(buyer.address, 1);
            await klunkazContract.connect(buyer).transferFrom(seller.address, buyer.address, 1);

            const newOwner = await klunkazContract.ownerOf(1);
            expect(newOwner).to.equal(buyer.address);
        });

        it("Should update bike price", async function () {
            const initialPrice = ethers.parseEther("1.0");
            const newPrice = ethers.parseEther("1.5");
            
            await klunkazContract.connect(seller).listBike(
                initialPrice,
                sampleBike.details,
                sampleBike.metadata
            );

            await klunkazContract.connect(seller).updatePrice(1, newPrice);
            const bike = await klunkazContract.getBike(1);
            expect(bike.price).to.equal(newPrice);
        });
    });
});