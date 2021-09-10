const RBT = artifacts.require("./token/RBT.sol");

var config =  {
    "name": "RBT",
    "symbol": "RBT",
    "decimals": 18,
    "supply": "4000000000"
  };


var RBTTokenAddr;
var rbtTokenIns;

async function main() {
    rbtTokenIns = await RBT.new(config.name,
        config.symbol,
        config.decimals,
        web3.utils.toBN(10).pow(web3.utils.toBN(config.decimals)).mul(web3.utils.toBN(config.supply)));
    RBTTokenAddr = rbtTokenIns.address
    console.log("RBTToken Created: ", RBTTokenAddr);
}

/// [Note]: For truffle exec (Remarks: Need to use module.exports)
module.exports = function(callback) {
    main().then(() => callback()).catch(err => callback(err));
};