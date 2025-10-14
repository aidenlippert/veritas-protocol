// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title VeriToken
 * @notice The utility token for the Veritas Protocol
 * @dev ERC20 token with fixed supply and owner-controlled minting for initial distribution
 */
contract VeriToken is ERC20, Ownable {
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 1 billion tokens

    constructor() ERC20("Veritas Token", "VERI") Ownable(msg.sender) {
        // Mint initial supply to deployer for controlled distribution
        _mint(msg.sender, MAX_SUPPLY);
    }

    /**
     * @notice Decimals for the token (18 by default from ERC20)
     */
    function decimals() public pure override returns (uint8) {
        return 18;
    }
}
