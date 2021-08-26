// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

// mock class using ERC1155
contract NFTMock is ERC1155 {
    // Token name
    string private _name;
    // Token symbol
    string private _symbol;
    //current tokenID
    uint256 private _currentTokenID = 0;


    constructor(string memory name_, string memory symbol_, string memory baseUri_) ERC1155(baseUri_) public {
        _name = name_;
        _symbol = symbol_;
    }

    function mint(address to_,uint256 id_, uint256 balance_) public {
        _mint(to_, id_, balance_, "");
    }

    function burn(address account_, uint256 id_, uint256 amount_) public {
        _burn(account_, id_, amount_);
    }

    function transferInternal(address from_, address to_, uint256 id_, uint256 value_) public {
        safeTransferFrom(from_, to_, id_, value_, "");
    }



    function name() public view virtual returns (string memory) {
        return _name;
    }

    function symbol() public view virtual returns (string memory) {
        return _symbol;
    }
}
