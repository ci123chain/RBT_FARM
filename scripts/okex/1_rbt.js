const RBT = artifacts.require("./token/RBT.sol");

var config =  {
    "name": "RBT",
    "symbol": "RBT",
    "decimals": 18,
    "supply": "400000000",
    "privInvest": {
        "percents": "6",
        "releaseRate": "10",
        "list" : [
          "0xCd0D8BE8554B084733B31ca214770d45460b8C0a",
          "0x55256b18bdbeFD3cB91dAe01861a96fECD3A5ada",
          "0x4B8705eEBC2462f9D75BEE20B5ecae78DceDb757",
          "0x0102046346999d79DE540608dC5d0aa0C7dB0d92",
          "0xCd0D8BE8554B084733B31ca214770d45460b8C0a"
        ],
        "amount": [10, 15, 20, 20, 35]
      },
      "teamInvest": {
        "percents": "5",
        "releaseRate": "5"
      }
  };


var RBTTokenAddr;
var rbtTokenIns;

async function main() {
    rbtTokenIns = await RBT.new(config.name,
        config.symbol,
        config.decimals,
        web3.utils.toBN(10).pow(web3.utils.toBN(config.decimals)).mul(web3.utils.toBN(config.supply)),
        config.privInvest.percents,
        config.privInvest.releaseRate,
        config.teamInvest.percents,
        config.teamInvest.releaseRate,
        );
    RBTTokenAddr = rbtTokenIns.address

    if (config.privInvest.list && 
        config.privInvest.list.length > 0 ) {
            await rbtTokenIns.addPrivInvs(config.privInvest.list, config.privInvest.amount)  
            console.log("Adding priv Investment")  
    }

    if (config.teamInvest.list && 
        config.teamInvest.list.length > 0 ) {
            await rbtTokenIns.addTeamInvs(config.teamInvest.list, config.teamInvest.amount)  
            console.log("Adding team Investment")  
    }

    console.log("RBTToken Created: ", RBTTokenAddr);
}

/// [Note]: For truffle exec (Remarks: Need to use module.exports)
module.exports = function(callback) {
    main().then(() => callback()).catch(err => callback(err));
};