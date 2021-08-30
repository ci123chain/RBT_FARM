// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// mock class using ERC1155
contract NFT1155 is ERC1155, Ownable {
    using SafeMath for uint256;
    using SafeMath for uint;

    // Token name
    string private _name;
    // Token symbol
    string private _symbol;
    //current tokenID
    uint256 private _currentTokenID = 0;

    uint256 private _created;

    struct NFTInfo {
        string  tokenName;
        uint256 totalBalance;
        uint256 nextBalance;
        uint256 peroidDecline;
        uint256 peroid;
        uint256 created;
        uint256 lastMintIndex;
        string  ipfsUrl;
        bool    used;
    }
    mapping(uint256 => NFTInfo) tokens;

    // event DebugEvent(uint256 _value1, uint256 _value2, uint256 _value3);

    constructor(string memory name_, string memory symbol_, string memory baseUri_) ERC1155(baseUri_) public {
        _name = name_;
        _symbol = symbol_;
    }

    function addToken(string memory tokenName_, uint256 initialBalance_, uint256 peroidDecline_, uint256 peroid_, string memory ipfsUrl_) public onlyOwner {
        require(peroidDecline_ > 0 && peroidDecline_ < 100, "decline invalid");
        uint256 currentid = getNextTokenID();
        NFTInfo storage info = tokens[currentid];
        info.tokenName = tokenName_;
        info.nextBalance = initialBalance_;
        info.peroidDecline = peroidDecline_;
        info.peroid = peroid_;
        info.created = now;
        info.ipfsUrl = ipfsUrl_;
        info.used = true;
        incrementTokenTypeId();
    }

    function mintFor(address to_, uint256 id_) public onlyOwner {
        NFTInfo storage info = tokens[id_];
        require(info.used == true, "token not existed");
        uint256 intervalSteps = (now - info.created).div(info.peroid) + 1;
        uint256 balance = info.nextBalance;
        uint256 totalBalance = info.totalBalance;

        for (uint256 step = info.lastMintIndex; step < intervalSteps; step++) {
            if (step != 0) {
                balance = balance.mul(100 - info.peroidDecline).div(100);
            }
            _mint(to_, id_, balance, "");
            totalBalance += balance;
        }
        info.nextBalance = balance;
        info.totalBalance = totalBalance;
        info.lastMintIndex = intervalSteps;
    }

    function ipfsData(uint256 id_) public view returns (string memory) {
        NFTInfo storage info = tokens[id_];
        require(info.used == true, "token not existed");
        return info.ipfsUrl;
    }

    function transferFrom(address from_, address to_, uint256 id_, uint256 value_) public {
        safeTransferFrom(from_, to_, id_, value_, "");
    }

    function name() public view virtual returns (string memory) {
        return _name;
    }

    function symbol() public view virtual returns (string memory) {
        return _symbol;
    }

    /**
    * @dev calculates the next token ID based on value of _currentTokenID
    * @return uint256 for the next token ID
    */
    function getNextTokenID() internal virtual returns (uint256) {
        uint256 nextTokenID =  _currentTokenID + 1;
        return nextTokenID;
    }

    /**
    * @dev increments the value of _currentTokenID
    */
    function incrementTokenTypeId() private  {
        _currentTokenID++;
    }

    // required function to allow receiving ERC-1155
    function onERC1155Received(
        address operator,
        address from,
        uint256 id,
        uint256 value,
        bytes calldata data
    )
        external
        returns(bytes4)
    {
        return bytes4(keccak256("onERC1155Received(address,address,uint256,uint256,bytes)"));
    }
}
