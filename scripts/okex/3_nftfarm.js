const Web3 = require('web3');
const NFTFarm = artifacts.require("./NFTFarm.sol")
const RBT = artifacts.require("./token/RBT.sol")
const {RBTTokenAddr, NFT1155Addr} = require("./const.js")

var config =  {
    "delay": 100,
    "rewardPerBlock": 100,
    "rewardBlocks": 21600,
    "fund": "99532800",
    "list": [
      {
        "index": 1,
        "allocPoint": 10
      },{
        "index": 2,
        "allocPoint": 30
      },{
        "index": 3,
        "allocPoint": 40
      }
    ]
  }

let nftFarmIns;
var NFTFarmAddr;

async function main() {

    const rbtTokenIns= await RBT.at(RBTTokenAddr)
    const rbtDecimals = await rbtTokenIns.decimals()

    const currentBlock = await web3.eth.getBlockNumber();
    const startBlock = web3.utils.toBN(currentBlock).add(web3.utils.toBN(config.delay))

    if (NFTFarmAddr && NFTFarmAddr.length > 0 ){
        nftFarmIns = await NFTFarm.at(NFTFarmAddr)
        console.log("NFTFarm At: ", NFTFarmAddr);
    } else {
        nftFarmIns =  await NFTFarm.new(RBTTokenAddr, config.rewardPerBlock, config.rewardBlocks, startBlock)
        NFTFarmAddr = nftFarmIns.address
        console.log("NFTFarm Created: ", NFTFarmAddr);
    }

    if (config.fund) {
        const fund = web3.utils.toBN(10).pow(rbtDecimals).mul(web3.utils.toBN(config.fund))
        await rbtTokenIns.approve(NFTFarmAddr, fund);
        console.log(`Approve succeed`, fund.toString())
        await nftFarmIns.fund(fund);
        console.log(`Fund succeed`, fund.toString())
    }

    for (index in config.list) {
        const token = config.list[index]
        await nftFarmIns.add(token.allocPoint, NFT1155Addr, token.index, false);
        console.log("Add to NFTFarm ", NFT1155Addr)
    }
   
}

/// [Note]: For truffle exec (Remarks: Need to use module.exports)
module.exports = function(callback) {
    main().then(() => callback()).catch(err => callback(err));
};