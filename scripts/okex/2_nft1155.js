const Web3 = require('web3');
const NFT1155 = artifacts.require("./token/NFT1155.sol");


var config =  {
    "exchangeToken": {
      "desc": "USDT 地址",
      "address": "0xe579156f9dEcc4134B5E3A30a24Ac46BB8B01281"
    },
    "list": [
      {
        "index": 1,
        "name": "NFT1",
        "balance": 10000,
        "weeklyMintAmount": 1500,
        "weeklyMintDiscount": 90,
        "period": 604800,
        "price": 99,
        "ipfsUrl": "https://s2-cdn.oneitfarm.com/llsgFqg0A8cMOpxxml2yrVu3EhHj"
      }, 
      {
        "index": 2,
        "name": "NFT2",
        "balance": 5000,
        "weeklyMintAmount": 750,
        "weeklyMintDiscount": 90,
        "period": 604800,
        "price": 199,
        "ipfsUrl": "https://s2-cdn.oneitfarm.com/lgHm7WSslSdooGoBua0GVChkhcvt"
      }, 
      {
        "index": 3,
        "name": "NFT3",
        "balance": 2000,
        "weeklyMintAmount": 300,
        "weeklyMintDiscount": 90,
        "period": 604800,
        "price": 599,
        "ipfsUrl": "https://s2-cdn.oneitfarm.com/llJBFMTIEcSCkfdlw9x-MuzhO6sB"
      }
    ]
  };

let nft1155Ins;
var NFT1155Addr;

async function main() {

    const nftExchangeToken = config.exchangeToken.address
    console.log("use nft exchange token: ", nftExchangeToken)
    nft1155Ins = await NFT1155.new("RBT_NFT1155", "NFT1155", nftExchangeToken, "")
    NFT1155Addr = nft1155Ins.address
    console.log("NFT1155 Created", NFT1155Addr)

    const erc20Temp = await RBT.at(nftExchangeToken)
    const decimals = await erc20Temp.decimals()

    for (index in config.list) {
        const nft = config.list[index]
        // 除以10 是因为 price 不支持小数本身乘以了10
        const bigPrice = web3.utils.toBN(10).pow(decimals).div(web3.utils.toBN(10)).mul(web3.utils.toBN(nft.price));
        await nft1155Ins.addToken(nft.name, nft.balance, nft.weeklyMintAmount, nft.weeklyMintDiscount, nft.period, nft.ipfsUrl, bigPrice)
        console.log("Add NFT Token ", nft.name)
        await nft1155Ins.mintFor(nft.index)
        console.log("Mint NFT Success ", nft.name)
    }
}

/// [Note]: For truffle exec (Remarks: Need to use module.exports)
module.exports = function(callback) {
    main().then(() => callback()).catch(err => callback(err));
};