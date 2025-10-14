// Sources flattened with hardhat v2.26.3 https://hardhat.org

// SPDX-License-Identifier: MIT

// File @openzeppelin/contracts/utils/Context.sol@v5.4.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.1) (utils/Context.sol)

pragma solidity ^0.8.20;

/**
 * @dev Provides information about the current execution context, including the
 * sender of the transaction and its data. While these are generally available
 * via msg.sender and msg.data, they should not be accessed in such a direct
 * manner, since when dealing with meta-transactions the account sending and
 * paying for execution may not be the actual sender (as far as an application
 * is concerned).
 *
 * This contract is only required for intermediate, library-like contracts.
 */
abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }

    function _contextSuffixLength() internal view virtual returns (uint256) {
        return 0;
    }
}


// File @openzeppelin/contracts/access/Ownable.sol@v5.4.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (access/Ownable.sol)

pragma solidity ^0.8.20;

/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * The initial owner is set to the address provided by the deployer. This can
 * later be changed with {transferOwnership}.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyOwner`, which can be applied to your functions to restrict their use to
 * the owner.
 */
abstract contract Ownable is Context {
    address private _owner;

    /**
     * @dev The caller account is not authorized to perform an operation.
     */
    error OwnableUnauthorizedAccount(address account);

    /**
     * @dev The owner is not a valid owner account. (eg. `address(0)`)
     */
    error OwnableInvalidOwner(address owner);

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Initializes the contract setting the address provided by the deployer as the initial owner.
     */
    constructor(address initialOwner) {
        if (initialOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _transferOwnership(initialOwner);
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if the sender is not the owner.
     */
    function _checkOwner() internal view virtual {
        if (owner() != _msgSender()) {
            revert OwnableUnauthorizedAccount(_msgSender());
        }
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby disabling any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        if (newOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _transferOwnership(newOwner);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Internal function without access restriction.
     */
    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}


// File contracts/StatusList2021Registry.sol

// Original license: SPDX_License_Identifier: MIT
pragma solidity ^0.8.20;

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
