// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

// mock class using ERC1155
contract NFTMock is ERC1155("") {
    constructor (    
        uint256 initialBalance
    ) public payable {
        _mint(msg.sender, 1, initialBalance, "");
    }

    function mint(address to, uint256 balance) public {
        _mint(to, 1, balance, "");
    }

    function burn(address account, uint256 amount) public {
        _burn(account, 1, amount);
    }

    function transferInternal(address from, address to, uint256 value) public {
        
        safeTransferFrom(from, to, 1, value, "");
    }

}
