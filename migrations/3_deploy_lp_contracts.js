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

  var lpfarmInstance

  deploy = deploy  
    .then(() => {    
      return web3.eth.getBlockNumber();
    })
    .then((currentBlock) => {
      const startBlock = config.startBlock
          || web3.utils.toBN(currentBlock).add(web3.utils.toBN(config.lpfarm.delay));

      return deployer.deploy(
        LPFarm,
        ERC20.address,
        web3.utils.toBN(config.lpfarm.rewardPerBlock),
        config.lpfarm.rewardBlocks,
        startBlock
      );
    });

    

    if (config.lpfarm.fund) {
      deploy = deploy
        .then(() => { return LPFarm.deployed(); })
        .then((lpfarm) => {
          lpfarmInstance = lpfarm
          return ERC20.at(ERC20.address);
        })
        .then((erc20Instance) => {
          return erc20Instance.approve(lpfarmInstance.address, web3.utils.toBN(config.lpfarm.fund));
        })
        .then(() => {
          return lpfarmInstance.fund(web3.utils.toBN(config.lpfarm.fund));
        });
    }

    config.lpfarm.list.forEach((token) => {
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
      .then(() => {
        return lpfarmInstance.add(
          token.allocPoint,
          token.address || LP.address,
          false
        );
      });
    });

    // var OutPut = require("../output.json");
    // OutPut.LPFarm = lpfarmInstance.address;
    // fs.writeFileSync('../output.json', JSON.stringify(OutPut));
};

