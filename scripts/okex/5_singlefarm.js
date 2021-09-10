const Web3 = require('web3');
const LPFarm = artifacts.require("./LPFarm.sol");
const allConfigs = require("../../config.json");
const RBT = artifacts.require("./token/RBT.sol");
const {RBTTokenAddr} = require("./const.js")

var config =  {
    "list": [
      {
        "address": `${RBTTokenAddr}`,
        "name": "RBT",
        "allocPoint": 12
      },
      {
        "address": "0xDa9d14072Ef2262c64240Da3A93fea2279253611",
        "name": "OKB",
        "allocPoint": 10
      }, {
        "address": "0xe579156f9dEcc4134B5E3A30a24Ac46BB8B01281",
        "name": "USDT",
        "allocPoint": 10
      }, {
        "address": "0xDF950cEcF33E64176ada5dD733E170a56d11478E",
        "name": "ETHK",
        "allocPoint": 10
      }, 
      {
        "address": "0x09973e7e3914EB5BA69C7c025F30ab9446e3e4e0",
        "name": "BTCK",
        "allocPoint": 10
      }
    ],
    "fund": "64696320",
    "rewardPerBlock": "100",
    "rewardBlocks": 21600,
    "delay": 300
  };

let singleStakeFarmIns;
var SingleStakingFarmAddr;

async function main() {

    const rbtTokenIns= await RBT.at(RBTTokenAddr)
    const rbtDecimals = await rbtTokenIns.decimals()

    const currentBlock = await web3.eth.getBlockNumber();
    const startBlock = web3.utils.toBN(currentBlock).add(web3.utils.toBN(config.delay))

    if (SingleStakingFarmAddr && SingleStakingFarmAddr.length > 0 ){
        singleStakeFarmIns = await LPFarm.at(SingleStakingFarmAddr)
        console.log("SingleStakingFarm At: ", SingleStakingFarmAddr);
    } else {
        singleStakeFarmIns = await LPFarm.new(RBTTokenAddr, web3.utils.toBN(config.rewardPerBlock),  web3.utils.toBN(config.rewardBlocks), startBlock)
        SingleStakingFarmAddr = singleStakeFarmIns.address
        console.log("SingleStakingFarm Created: ", SingleStakingFarmAddr);
    }
    if (config.fund) {
        const fund = web3.utils.toBN(10).pow(rbtDecimals).mul(web3.utils.toBN(config.fund))

        await rbtTokenIns.approve(singleStakeFarmIns.address, fund);
        console.log(`Approve succeed`, fund.toString())
        await singleStakeFarmIns.fund(fund);
        console.log(`Fund succeed`, fund.toString())
    }

    for (index in config.list) {
        const token = config.list[index]
        await singleStakeFarmIns.add(token.allocPoint, token.address , false);
        console.log(`Added ${token.name} token to singlefarm `, token.address)
    }
}

/// [Note]: For truffle exec (Remarks: Need to use module.exports)
module.exports = function(callback) {
    main().then(() => callback()).catch(err => callback(err));
};