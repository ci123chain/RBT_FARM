// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

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

    IERC20 usdtAddr;

    struct NFTInfo {
        string  tokenName;
        uint256 price;
        uint256 created;
        string  ipfsUrl;
        bool    used;
    }

    struct RewardInfo {
        uint256 lastWeekIndex;
        uint256 lastReward;
        uint256 weeklyMintPercent;
        uint256 mintInterval;
        uint256 lastMintDay;
    }

    mapping(uint256 => RewardInfo) rewardInfos; 
    mapping(uint256 => NFTInfo) tokens;

    event NFTSelled(uint256 _id, address _buyer, uint256 _amount);

    constructor(string memory name_, string memory symbol_, address usdtaddr_, string memory baseUri_) ERC1155(baseUri_) public {
        _name = name_;
        _symbol = symbol_;
        usdtAddr = IERC20(usdtaddr_);
    }

    function addToken(string memory tokenName_, uint256 initialBalance_, uint256 peroidMint_, uint256 peroidMintPercent_, uint256 peroid_, string memory ipfsUrl_, uint256 price_) public onlyOwner {
        require(peroidMintPercent_ > 0 && peroidMintPercent_ < 100, "decline invalid");
        uint256 currentid = getNextTokenID();
        NFTInfo storage info = tokens[currentid];
        info.tokenName = tokenName_;
        info.created = now;
        info.ipfsUrl = ipfsUrl_;
        info.price = price_;
        info.used = true;

        RewardInfo storage rinfo = rewardInfos[currentid];
        rinfo.lastWeekIndex = 0;
        rinfo.lastReward = peroidMint_;
        rinfo.weeklyMintPercent = peroidMintPercent_;
        rinfo.mintInterval = peroid_;
        rinfo.lastMintDay = 0;

        incrementTokenTypeId();
        _mint(owner(), currentid, initialBalance_.add(peroidMint_), "");
    }

    function mintFor(uint256 id_) public {
        NFTInfo storage info = tokens[id_];
        require(info.used == true, "token not existed");

        RewardInfo storage rinfo = rewardInfos[id_];
        uint256 intervaldays = (now - info.created).div(rinfo.mintInterval);
        uint256 totalAmount;
        for (uint256 date = rinfo.lastMintDay; date < intervaldays; date++) {
            uint256 amount = computer(id_, date + 1);
            totalAmount = totalAmount.add(amount);
        }
        _mint(owner(), id_, totalAmount, "");
        if (intervaldays != rinfo.lastMintDay) {
            rinfo.lastMintDay = intervaldays;
        }
    }

    function buyone(uint256 id_) public {
        address buyer = msg.sender;
        NFTInfo storage info = tokens[id_];
        require(info.used == true, "token not existed");

        require(balanceOf(owner(), id_) > 0, "not enough to sell");
        require(usdtAddr.balanceOf(buyer) > info.price, "not enough to buy");

        usdtAddr.transferFrom(buyer, owner(), info.price);
        safeTransferFrom(address(this), buyer, id_, 1, '0x');

        emit NFTSelled(id_, buyer, 1);
    }

    function computer(uint256 id_, uint256 date) private returns (uint256) {
        RewardInfo storage rewardInfo = rewardInfos[id_];
        uint256 thisWeek = date.div(7);
        for (uint256 week = rewardInfo.lastWeekIndex; week < thisWeek; week++) {
            rewardInfo.lastReward = rewardInfo.lastReward.mul(rewardInfo.weeklyMintPercent).div(100);
        }
        rewardInfo.lastWeekIndex = thisWeek;
        return rewardInfo.lastReward;
    }

    function getOwner()public view returns (address) {
        return owner();
    }

    function poolInfo(uint256 tokenid_) public view returns (string memory, uint256, string memory) {
        NFTInfo storage info = tokens[tokenid_];
        require(info.used == true, "token not existed");
        return (info.tokenName, info.price, info.ipfsUrl);
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
