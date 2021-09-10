const Web3 = require('web3');
const Market = artifacts.require("./Market.sol");
const NFT1155 = artifacts.require("./token/NFT1155.sol");

const {NFT1155Addr} = require("./const.js")


var config =  {
    "desc": "USDT 地址",
    "address": "0xe579156f9dEcc4134B5E3A30a24Ac46BB8B01281"
  };

let marketIns;
var MarketAddr;

async function main() {

    const marketToken = config.address
    console.log("use USDT for exchange: ", marketToken)
    marketIns = await Market.new(marketToken, NFT1155Addr)
    MarketAddr = marketIns.address
    console.log("Market Created", MarketAddr)

    const nft1155Ins = await NFT1155.at(NFT1155Addr)
    await nft1155Ins.setApprovalForAll(marketIns.address, true);
    console.log("NFT1155 Approved for ", MarketAddr)
    
}

/// [Note]: For truffle exec (Remarks: Need to use module.exports)
module.exports = function(callback) {
    main().then(() => callback()).catch(err => callback(err));
};