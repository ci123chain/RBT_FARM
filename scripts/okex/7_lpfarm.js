const Web3 = require('web3');
const LPFarm = artifacts.require("./LPFarm.sol");
const allConfigs = require("../../config.json");
const RBT = artifacts.require("./token/RBT.sol");
const {RBTTokenAddr} = require("./const.js")

var config =  {
    "list": [
      {
        "name": "OKTLP",
        "address": "",
        "allocPoint": 30
      },
      {
        "name": "USDTLP",
        "address": "",
        "allocPoint": 30
      },
      {
        "name": "BTCLP",
        "address": "",
        "allocPoint": 10
      },
      {
        "name": "ETHLP",
        "address": "",
        "allocPoint": 10
      }
    ],
    "fund": "99532800",
    "rewardPerBlock": "100",
    "rewardBlocks": 21600,
    "delay": 30
  };

let lpFarmIns;
var LPFarmAddr;

async function main() {

    const rbtTokenIns= await RBT.at(RBTTokenAddr)
    const rbtDecimals = await rbtTokenIns.decimals()

    const currentBlock = await web3.eth.getBlockNumber();
    const startBlock = web3.utils.toBN(currentBlock).add(web3.utils.toBN(config.delay))
    if (LPFarmAddr && LPFarmAddr.length > 0 ){
        lpFarmIns = await LPFarm.at(LPFarmAddr)
        console.log("LPFarm At: ", LPFarmAddr);
    } else {
        lpFarmIns = await LPFarm.new(RBTTokenAddr, web3.utils.toBN(config.rewardPerBlock),  web3.utils.toBN(config.rewardBlocks), startBlock)
        LPFarmAddr = lpFarmIns.address
        console.log("LPFarm Created: ", LPFarmAddr);
    }

    if (config.fund) {
        const fund = web3.utils.toBN(10).pow(rbtDecimals).mul(web3.utils.toBN(config.fund))
        await rbtTokenIns.approve(lpFarmIns.address, fund);
        console.log(`Approve succeed`, fund.valueOf())
        await lpFarmIns.fund(fund);
        console.log(`Fund succeed`, fund.valueOf())
    }

    for (index in config.list) {
        const token = config.list[index]
        await lpFarmIns.add(token.allocPoint, token.address, false);
        console.log(`Added ${token.name} token to lpfarm `, token.address)
    }
   
}

/// [Note]: For truffle exec (Remarks: Need to use module.exports)
module.exports = function(callback) {
    main().then(() => callback()).catch(err => callback(err));
};