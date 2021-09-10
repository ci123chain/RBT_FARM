const Web3 = require('web3');
const LockedStaking = artifacts.require("./LockedStaking.sol");
const RBT = artifacts.require("./token/RBT.sol");
const {RBTTokenAddr, SingleStakingFarmAddr} = require("./const.js")

var config =  {
    "list": [
      {
        "days": 7,
        "rate": 115
      },{
        "days": 15,
        "rate": 130
      },{
        "days": 30,
        "rate": 150
      }
    ],
    "fund": "29859840",
    "delay": 300
  };

let lockedStakeFarmIns;
var LockedStakeFarmAddr;

async function main() {

    if (!SingleStakingFarmAddr || !RBTTokenAddr) {
        console.log("unlockedAddr or RBTTokenAddr should not be empty");
        return
    }
    const rbtTokenIns= await RBT.at(RBTTokenAddr)
    const rbtDecimals = await rbtTokenIns.decimals()

    lockedStakeFarmIns = await LockedStaking.new(RBTTokenAddr, SingleStakingFarmAddr)
    LockedStakeFarmAddr = lockedStakeFarmIns.address
    console.log("LockedStakeFarm Created: ", LockedStakeFarmAddr);

    if (config.fund) {
        const fund = web3.utils.toBN(10).pow(rbtDecimals).mul(web3.utils.toBN(config.fund))
        await rbtTokenIns.approve(LockedStakeFarmAddr, fund);
        console.log(`Approve succeed`, fund.valueOf())
        await lockedStakeFarmIns.fund(fund);
        console.log(`Fund succeed`, fund.valueOf())
    }

    for (index in config.list) {
        const pool = config.list[index]
        await lockedStakeFarmIns.add(pool.days, pool.rate);
        console.log("Added to pool with days: ", pool.days, " rate: ", pool.rate)
    }
     
    await lockedStakeFarmIns.close(true);
    console.log("Closed LockedStaking");   
}

/// [Note]: For truffle exec (Remarks: Need to use module.exports)
module.exports = function(callback) {
    main().then(() => callback()).catch(err => callback(err));
};