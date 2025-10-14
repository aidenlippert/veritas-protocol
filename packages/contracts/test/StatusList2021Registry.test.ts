import { expect } from "chai";
import { ethers } from "hardhat";
import { StatusList2021Registry } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("StatusList2021Registry", function () {
  let registry: StatusList2021Registry;
  let issuer: SignerWithAddress;
  let otherIssuer: SignerWithAddress;

  beforeEach(async function () {
    [issuer, otherIssuer] = await ethers.getSigners();

    const RegistryFactory = await ethers.getContractFactory("StatusList2021Registry");
    registry = await RegistryFactory.deploy();
    await registry.waitForDeployment();
  });

  describe("Status Updates", function () {
    it("should allow issuer to revoke a credential", async function () {
      const listIndex = 0;
      const bitIndex = 42;

      await expect(registry.connect(issuer).updateStatus(listIndex, bitIndex, true))
        .to.emit(registry, "StatusUpdated")
        .withArgs(issuer.address, listIndex, bitIndex, true);

      const isRevoked = await registry.isRevoked(issuer.address, listIndex, bitIndex);
      expect(isRevoked).to.be.true;
    });

    it("should allow issuer to un-revoke a credential", async function () {
      const listIndex = 0;
      const bitIndex = 10;

      // Revoke first
      await registry.connect(issuer).updateStatus(listIndex, bitIndex, true);
      expect(await registry.isRevoked(issuer.address, listIndex, bitIndex)).to.be.true;

      // Un-revoke
      await registry.connect(issuer).updateStatus(listIndex, bitIndex, false);
      expect(await registry.isRevoked(issuer.address, listIndex, bitIndex)).to.be.false;
    });

    it("should handle multiple credentials independently", async function () {
      const listIndex = 0;

      await registry.connect(issuer).updateStatus(listIndex, 0, true);
      await registry.connect(issuer).updateStatus(listIndex, 1, false);
      await registry.connect(issuer).updateStatus(listIndex, 2, true);

      expect(await registry.isRevoked(issuer.address, listIndex, 0)).to.be.true;
      expect(await registry.isRevoked(issuer.address, listIndex, 1)).to.be.false;
      expect(await registry.isRevoked(issuer.address, listIndex, 2)).to.be.true;
    });

    it("should reject bit index >= 256", async function () {
      await expect(
        registry.connect(issuer).updateStatus(0, 256, true)
      ).to.be.revertedWith("Bit index must be < 256");
    });
  });

  describe("Batch Updates", function () {
    it("should batch revoke multiple credentials", async function () {
      const listIndex = 0;
      const bitIndices = [5, 15, 25, 100, 200];

      await registry.connect(issuer).batchUpdateStatus(listIndex, bitIndices, true);

      for (const bitIndex of bitIndices) {
        expect(await registry.isRevoked(issuer.address, listIndex, bitIndex)).to.be.true;
      }
    });

    it("should batch un-revoke multiple credentials", async function () {
      const listIndex = 0;
      const bitIndices = [7, 77, 177];

      // Revoke first
      await registry.connect(issuer).batchUpdateStatus(listIndex, bitIndices, true);

      // Un-revoke in batch
      await registry.connect(issuer).batchUpdateStatus(listIndex, bitIndices, false);

      for (const bitIndex of bitIndices) {
        expect(await registry.isRevoked(issuer.address, listIndex, bitIndex)).to.be.false;
      }
    });
  });

  describe("Issuer Isolation", function () {
    it("should maintain separate status lists per issuer", async function () {
      const listIndex = 0;
      const bitIndex = 50;

      await registry.connect(issuer).updateStatus(listIndex, bitIndex, true);
      await registry.connect(otherIssuer).updateStatus(listIndex, bitIndex, false);

      expect(await registry.isRevoked(issuer.address, listIndex, bitIndex)).to.be.true;
      expect(await registry.isRevoked(otherIssuer.address, listIndex, bitIndex)).to.be.false;
    });
  });

  describe("Status List Retrieval", function () {
    it("should return the full status list", async function () {
      const listIndex = 0;

      await registry.connect(issuer).updateStatus(listIndex, 0, true);
      await registry.connect(issuer).updateStatus(listIndex, 255, true);

      const statusList = await registry.getStatusList(issuer.address, listIndex);

      // Bit 0 and bit 255 should be set
      expect(statusList & BigInt(1)).to.equal(BigInt(1));
      expect(statusList & (BigInt(1) << BigInt(255))).to.not.equal(BigInt(0));
    });
  });

  describe("Edge Cases", function () {
    it("should handle bit index 0", async function () {
      const listIndex = 0;
      const bitIndex = 0;

      await registry.connect(issuer).updateStatus(listIndex, bitIndex, true);
      expect(await registry.isRevoked(issuer.address, listIndex, bitIndex)).to.be.true;
    });

    it("should handle bit index 255 (maximum)", async function () {
      const listIndex = 0;
      const bitIndex = 255;

      await registry.connect(issuer).updateStatus(listIndex, bitIndex, true);
      expect(await registry.isRevoked(issuer.address, listIndex, bitIndex)).to.be.true;
    });

    it("should handle large list indices", async function () {
      const listIndex = 999999;
      const bitIndex = 128;

      await registry.connect(issuer).updateStatus(listIndex, bitIndex, true);
      expect(await registry.isRevoked(issuer.address, listIndex, bitIndex)).to.be.true;
    });

    it("should return false for never-set credentials", async function () {
      expect(await registry.isRevoked(issuer.address, 0, 0)).to.be.false;
      expect(await registry.isRevoked(issuer.address, 999, 123)).to.be.false;
    });

    it("should handle empty batch updates", async function () {
      await registry.connect(issuer).batchUpdateStatus(0, [], true);
      // Should not revert
    });

    it("should handle batch with mixed valid indices", async function () {
      const listIndex = 0;
      const bitIndices = [0, 127, 128, 255];

      await registry.connect(issuer).batchUpdateStatus(listIndex, bitIndices, true);

      for (const bitIndex of bitIndices) {
        expect(await registry.isRevoked(issuer.address, listIndex, bitIndex)).to.be.true;
      }
    });
  });

  describe("Gas Optimization Tests", function () {
    it("should efficiently handle batch updates", async function () {
      const listIndex = 0;
      const bitIndices = Array.from({ length: 50 }, (_, i) => i);

      const tx = await registry.connect(issuer).batchUpdateStatus(listIndex, bitIndices, true);
      const receipt = await tx.wait();

      // Should complete in reasonable gas
      expect(receipt?.gasUsed).to.be.lessThan(1000000n);
    });

    it("should efficiently query revocation status", async function () {
      const listIndex = 0;
      const bitIndex = 42;

      await registry.connect(issuer).updateStatus(listIndex, bitIndex, true);

      const gasEstimate = await registry.isRevoked.estimateGas(issuer.address, listIndex, bitIndex);
      expect(gasEstimate).to.be.lessThan(30000n);
    });
  });

  describe("Access Control", function () {
    it("should allow any address to revoke their own credentials", async function () {
      const [_, addr1, addr2] = await ethers.getSigners();

      await registry.connect(addr1).updateStatus(0, 1, true);
      await registry.connect(addr2).updateStatus(0, 2, true);

      expect(await registry.isRevoked(addr1.address, 0, 1)).to.be.true;
      expect(await registry.isRevoked(addr2.address, 0, 2)).to.be.true;
    });

    it("should not allow cross-issuer status reads to affect each other", async function () {
      const [addr1, addr2] = await ethers.getSigners();

      await registry.connect(addr1).updateStatus(0, 5, true);

      // addr2's view should be independent
      expect(await registry.isRevoked(addr2.address, 0, 5)).to.be.false;
    });
  });

  describe("Integration Scenarios", function () {
    it("should handle rapid credential lifecycle", async function () {
      const listIndex = 0;
      const bitIndex = 99;

      // Issue (not revoked)
      expect(await registry.isRevoked(issuer.address, listIndex, bitIndex)).to.be.false;

      // Revoke
      await registry.connect(issuer).updateStatus(listIndex, bitIndex, true);
      expect(await registry.isRevoked(issuer.address, listIndex, bitIndex)).to.be.true;

      // Reactivate
      await registry.connect(issuer).updateStatus(listIndex, bitIndex, false);
      expect(await registry.isRevoked(issuer.address, listIndex, bitIndex)).to.be.false;

      // Revoke again
      await registry.connect(issuer).updateStatus(listIndex, bitIndex, true);
      expect(await registry.isRevoked(issuer.address, listIndex, bitIndex)).to.be.true;
    });

    it("should handle multiple concurrent issuers", async function () {
      const signers = await ethers.getSigners();
      const numIssuers = 5;
      const listIndex = 0;

      for (let i = 0; i < numIssuers; i++) {
        await registry.connect(signers[i]).updateStatus(listIndex, i * 10, true);
      }

      for (let i = 0; i < numIssuers; i++) {
        expect(await registry.isRevoked(signers[i].address, listIndex, i * 10)).to.be.true;
      }
    });
  });
});
