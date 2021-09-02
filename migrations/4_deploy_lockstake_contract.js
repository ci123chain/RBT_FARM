const LockedStaking = artifacts.require("./LockedStaking.sol");
const ERC20 = artifacts.require("./token/RBT.sol");
const LPFarm = artifacts.require("./LPFarm.sol");

module.exports = function(deployer, network, addresses) {
    let deploy = deployer;
  // market
    deploy = deploy.then(()=> {
      return deployer.deploy(
        LockedStaking,
        ERC20.address,
        LPFarm.address
      )
    }).then(() => {return LockedStaking.deployed(); });
  
    return deploy;
  }