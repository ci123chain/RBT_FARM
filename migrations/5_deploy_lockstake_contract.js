const LockedStaking = artifacts.require("./LockedStaking.sol");
const ERC20 = artifacts.require("./token/RBT.sol");
const LPFarm = artifacts.require("./LPFarm.sol");
const allConfigs = require("../config.json");

module.exports = function(deployer, network, addresses) {
  const config = allConfigs[network.replace(/-fork$/, '')] || allConfigs.default;

  if (!config) {
    return;
  }
    let deploy = deployer;
    var instance

    deploy = deploy.then(()=> {
      return deployer.deploy(
        LockedStaking,
        ERC20.address,
        LPFarm.address
      )
    }).then(() => {return LockedStaking.deployed(); })
    .then((lsinstance) => {
      instance= lsinstance
      return ERC20.at(ERC20.address);
    })
    .then((erc20Instance) => {
      return erc20Instance.approve(instance.address, web3.utils.toBN(config.lockstakefarm.fund));
    })
    .then(() => {
      return instance.fund(web3.utils.toBN(config.lockstakefarm.fund));
    });
    
    config.lockstakefarm.list.forEach((pool) => {
      deploy = deploy
      .then(() => {
        return instance.add(
          pool.days,
          pool.rate
        );
      });
    });

    // var OutPut = require("../output.json");
    // OutPut.LockedStakeFarm = instance.address;
    // fs.writeFileSync('../output.json', JSON.stringify(OutPut));
    return deploy;
  }