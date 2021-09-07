// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155Receiver.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";


interface MyNFT1155 is IERC1155 {
    function poolInfo(uint256 tokenid_) external view returns (string memory, uint256, string memory);
    function getOwner()external view returns (address);
}

contract Market is Ownable, ERC1155Receiver {
    using SafeMath for uint256;
    using SafeMath for uint;

    IERC20 public erc20Instance;
    MyNFT1155 public nftInstance;

    event NewTrade(uint256 _id, address _seller, uint256 _amount, uint256 _price);
    event TradeChanged(uint256 _id, uint _status);
    event NFTSelled(uint256 _id, address _buyer, uint256 _amount);


    uint Cancel = 0;
    uint Open = 1;
    uint Closed = 2;
    uint Done = 3;

    // Info of the trade.
    struct Trade {
        address seller;
        uint256 amount; 
        uint256 price;
        uint256 tokenid;
        uint status;
    }
    Trade[] trades;

    constructor(IERC20 _erc20Instance, MyNFT1155 _nftInstance) public ERC1155Receiver(){
        require(address(_nftInstance) != address(0), "exchange to the zero address");
        erc20Instance = _erc20Instance;
        nftInstance = _nftInstance;
    }

    function mintOneNFT(uint256 id_) public {
        address buyer = msg.sender;
        uint256 price;
        (, price, ) = nftInstance.poolInfo(id_);
        address owner = nftInstance.getOwner();

        require(nftInstance.balanceOf(owner, id_) > 0, "not enough to sell");
        require(erc20Instance.allowance(buyer, address(this)) >= price, "not enough allowance to buy");

        erc20Instance.transferFrom(buyer, owner, price);
        nftInstance.safeTransferFrom(owner, buyer, id_, 1, "0x");
        emit NFTSelled(id_, buyer, 1);
    }

    // Create new trade from ERC1155 asset
    function newTrade(uint256 id_, uint256 number, uint256 price_) public {
        require(nftInstance.balanceOf(msg.sender, id_) >= number, "no enough tokens to create new trade");

        nftInstance.safeTransferFrom(msg.sender, address(this), id_, number, '0x');
        trades.push(Trade({
            seller: msg.sender,
            amount: number,
            price: price_,
            tokenid: id_,
            status: Open
        }));

        emit NewTrade(trades.length.sub(1), msg.sender, number, price_);
    }

    // Cancel trade with trade_id
    function cancelTrade(uint256 trade_id_) public {
        Trade storage trade = trades[trade_id_];
        require(msg.sender == trade.seller, "Trade can be open only by seller.");
        nftInstance.safeTransferFrom(address(this), trade.seller, trade.tokenid, trade.amount, '0x');
        trade.status = Cancel;

        delete trades[trade_id_];
        emit TradeChanged(trade_id_, Cancel);
    }

    // Close trade with trade_id
    function closeTrade(uint256 trade_id_) public onlyOwner {
        Trade storage trade = trades[trade_id_];
        require(
            msg.sender == trade.seller,
            "Trade can be open only by seller."
        );
        require(trade.seller != address(0), "trade_id_ not existed");
        trade.status = Closed;
        emit TradeChanged(trade_id_, Closed);
    }

    // Open trade with trade_id
    function openTrade(uint256 trade_id_) public onlyOwner {
        Trade storage trade = trades[trade_id_];
        require(trade.status != Cancel, "Trade Canceled");
        require(msg.sender == trade.seller, "Trade can be open only by seller.");
        require(trade.seller != address(0), "trade_id_ not existed");
        trade.status = Open;
        emit TradeChanged(trade_id_, Open);
    }

    // Bug a trade
    function bugTrade(uint256 trade_id_) public {
        address buyer = msg.sender;
        Trade storage trade = trades[trade_id_];
        require(trade.seller != buyer, "seller is buyer");
        require(trade.status == Open, "Trade not on sale");
        IERC20 receiver = IERC20(erc20Instance);
        receiver.transferFrom(buyer, trade.seller, trade.price);
        trade.status = Done;
        
        nftInstance.safeTransferFrom(address(this), buyer, trade.tokenid, trade.amount, '0x');
        emit TradeChanged(trade_id_, Done);
    }

    function getTrade(uint256 trade_id_) public view returns (Trade memory trade_) {
        Trade memory trade = trades[trade_id_];
        return trade;
    }

    function getTrades() public view returns (Trade[] memory) {
       return trades;
    }


    function onERC1155Received(
        address operator,
        address from,
        uint256 id,
        uint256 value,
        bytes calldata data
    ) external override returns (bytes4) {
        return (
            bytes4(
                keccak256(
                    "onERC1155Received(address,address,uint256,uint256,bytes)"
                )
            )
        );
    }

    function onERC1155BatchReceived(
        address operator,
        address from,
        uint256[] calldata ids,
        uint256[] calldata values,
        bytes calldata data
    ) external override returns (bytes4) {
        //Not allowed
        revert();
        return "";
    }
}