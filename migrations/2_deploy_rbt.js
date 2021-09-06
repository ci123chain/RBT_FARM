const ERC20 = artifacts.require("./token/RBT.sol");
const allConfigs = require("../config.json");
const fs = require('fs')

module.exports = function(deployer, network, addresses) {
    const config = allConfigs[network.replace(/-fork$/, '')] || allConfigs.default;
    if (!config) {
      return;
    }
  
    const erc20 = config.erc20;

    let deploy = deployer;
    
    if (!erc20.address) {
      deploy = deploy
        .then(() => {
          return deployer.deploy(
            ERC20,
            erc20.name,
            erc20.symbol,
            erc20.decimals,
            web3.utils.toBN(erc20.supply)
          );
        })
        .then(() => {return ERC20.deployed(); });
    } else {
      ERC20.address = erc20.address
    }

    // var OutPut = require("../output.json");    
    // OutPut.ERC20 = ERC20.address;
    // fs.writeFileSync('../output.json', JSON.stringify(OutPut));
}