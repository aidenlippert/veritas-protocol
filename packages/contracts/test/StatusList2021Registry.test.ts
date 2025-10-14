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
});
