const ERC20 = artifacts.require("./token/RBT.sol");
const LP = artifacts.require('./mock/LPMock.sol');
const LPFarm = artifacts.require("./LPFarm.sol");
const allConfigs = require("../config.json");

module.exports = function(deployer, network, addresses) {
  const config = allConfigs[network.replace(/-fork$/, '')] || allConfigs.default;

  if (!config) {
    return;
  }
  let deploy = deployer;

  let rainbowBlocks = 100;

  deploy = deploy  
    .then(() => {    
      return web3.eth.getBlockNumber();
    })
    .then((currentBlock) => {
      const startBlock = config.startBlock
          || web3.utils.toBN(currentBlock).add(web3.utils.toBN(config.delay));

      return deployer.deploy(
        LPFarm,
        ERC20.address,
        web3.utils.toBN(config.rewardPerBlock),
        rainbowBlocks,
        startBlock
      );
    });

    if (config.fund) {
      deploy = deploy
        .then(() => {
          return ERC20.at(ERC20.address);
        })
        .then((erc20Instance) => {
          return erc20Instance.approve(LPFarm.address, web3.utils.toBN(config.fund));
        })
        .then(() => { return LPFarm.deployed(); })
        .then((farmInstance) => {
          return farmInstance.fund(web3.utils.toBN(config.fund));
        });
    }

    config.lp.forEach((token) => {
      if (!token.address) {
        deploy = deploy
          .then(() => {
            return deployer.deploy(
              LP,
              token.name,
              token.symbol,
              token.decimals,
            );
          })
          .then(() => {
            return LP.deployed();
          })
          .then((lpInstance) => {
            const amount = web3.utils.toBN(10).pow(web3.utils.toBN(token.decimals))
              .mul(web3.utils.toBN(1000));

            const promises = addresses.map((address) => {
              return lpInstance.mint(address, amount);
            });

            return Promise.all(promises);
          });
      }
      deploy = deploy
      .then(() => { return LPFarm.deployed(); })
      .then((farmInstance) => {
        return farmInstance.add(
          token.allocPoint,
          token.address || LP.address,
          false
        );
      });
    });

    



};

