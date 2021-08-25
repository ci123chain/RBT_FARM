// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

// mock class using ERC20
contract ERC1155Mock is ERC1155("sampleURI") {
    constructor (    
        uint256 initialBalance
    ) public payable {
        _mint(msg.sender, 1, initialBalance, "");
    }
}