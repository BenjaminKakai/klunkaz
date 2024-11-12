import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("Klunkaz Reviews", function () {
    let klunkazContract: Contract;
    let owner: SignerWithAddress;
    let buyer: SignerWithAddress;
    let reviewer: SignerWithAddress;

    async function deployReviewFixture() {
        const Klunkaz = await ethers.getContractFactory("Klunkaz");
        const [owner, buyer, reviewer] = await ethers.getSigners();
        const klunkaz = await Klunkaz.deploy();
        
        return { klunkaz, owner, buyer, reviewer };
    }

    beforeEach(async function () {
        const { klunkaz, owner: _owner, buyer: _buyer, reviewer: _reviewer } = await loadFixture(deployReviewFixture);
        klunkazContract = klunkaz;
        owner = _owner;
        buyer = _buyer;
        reviewer = _reviewer;
    });

    describe("Review Management", function () {
        it("Should add a review successfully", async function () {
            const productId = 1;
            const rating = 4;
            const comment = "Great bike!";

            await klunkazContract.connect(reviewer).addReview(productId, rating, comment);
            const reviews = await klunkazContract.getProductReviews(productId);
            
            expect(reviews[0].reviewer).to.equal(reviewer.address);
            expect(reviews[0].rating).to.equal(rating);
            expect(reviews[0].comment).to.equal(comment);
        });

        it("Should like a review", async function () {
            const productId = 1;
            
            await klunkazContract.connect(reviewer).addReview(productId, 4, "Great bike!");
            await klunkazContract.connect(buyer).likeReview(productId, 0);
            
            const reviews = await klunkazContract.getProductReviews(productId);
            expect(reviews[0].likes).to.equal(1);
        });

        it("Should get user reviews", async function () {
            const productId = 1;
            
            await klunkazContract.connect(reviewer).addReview(productId, 4, "Great bike!");
            const userReviews = await klunkazContract.getUserReviews(reviewer.address);
            
            expect(userReviews.length).to.equal(1);
            expect(userReviews[0]).to.equal(productId);
        });
    });
});