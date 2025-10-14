// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title StatusList2021Registry
 * @notice Implements W3C StatusList2021 for efficient credential revocation
 * @dev Issuers manage their own bitstring status lists for credential revocation
 *
 * Gas-efficient design:
 * - Each bit represents one credential's status (0 = valid, 1 = revoked)
 * - 256 credentials can be managed in a single uint256
 * - Only issuers can update their own status lists
 */
contract StatusList2021Registry is Ownable {
    // Mapping: issuer address => list index => bitstring (256 credentials per uint256)
    mapping(address => mapping(uint256 => uint256)) public statusLists;

    // Events for transparency and off-chain indexing
    event StatusUpdated(
        address indexed issuer,
        uint256 indexed listIndex,
        uint256 indexed bitIndex,
        bool revoked
    );

    event StatusListCreated(
        address indexed issuer,
        uint256 indexed listIndex
    );

    constructor() Ownable(msg.sender) {}

    /**
     * @notice Update the revocation status of a single credential
     * @param listIndex The status list index (allows issuers to manage multiple lists)
     * @param bitIndex The position within the list (0-255 for each uint256)
     * @param revoked True to revoke, false to un-revoke
     */
    function updateStatus(
        uint256 listIndex,
        uint256 bitIndex,
        bool revoked
    ) external {
        require(bitIndex < 256, "Bit index must be < 256");

        uint256 currentList = statusLists[msg.sender][listIndex];
        uint256 mask = 1 << bitIndex;

        if (revoked) {
            // Set bit to 1 (revoked)
            statusLists[msg.sender][listIndex] = currentList | mask;
        } else {
            // Set bit to 0 (valid)
            statusLists[msg.sender][listIndex] = currentList & ~mask;
        }

        emit StatusUpdated(msg.sender, listIndex, bitIndex, revoked);
    }

    /**
     * @notice Batch update multiple credentials in a single transaction
     * @param listIndex The status list index
     * @param bitIndices Array of bit positions to update
     * @param revoked True to revoke all, false to un-revoke all
     */
    function batchUpdateStatus(
        uint256 listIndex,
        uint256[] calldata bitIndices,
        bool revoked
    ) external {
        uint256 currentList = statusLists[msg.sender][listIndex];

        for (uint256 i = 0; i < bitIndices.length; i++) {
            require(bitIndices[i] < 256, "Bit index must be < 256");

            uint256 mask = 1 << bitIndices[i];

            if (revoked) {
                currentList = currentList | mask;
            } else {
                currentList = currentList & ~mask;
            }

            emit StatusUpdated(msg.sender, listIndex, bitIndices[i], revoked);
        }

        statusLists[msg.sender][listIndex] = currentList;
    }

    /**
     * @notice Check if a credential is revoked
     * @param issuer The issuer's address
     * @param listIndex The status list index
     * @param bitIndex The position within the list
     * @return True if revoked, false if valid
     */
    function isRevoked(
        address issuer,
        uint256 listIndex,
        uint256 bitIndex
    ) external view returns (bool) {
        require(bitIndex < 256, "Bit index must be < 256");

        uint256 list = statusLists[issuer][listIndex];
        uint256 mask = 1 << bitIndex;

        return (list & mask) != 0;
    }

    /**
     * @notice Get the full status list for a given issuer and index
     * @param issuer The issuer's address
     * @param listIndex The status list index
     * @return The full 256-bit status list
     */
    function getStatusList(
        address issuer,
        uint256 listIndex
    ) external view returns (uint256) {
        return statusLists[issuer][listIndex];
    }
}
