const ERC20 = artifacts.require("./token/RBT.sol");
const LP = artifacts.require('./mock/LPMock.sol');
const SingleFarm = artifacts.require("./LPFarm.sol");
const allConfigs = require("../config.json");

module.exports = function(deployer, network, addresses) {
  const config = allConfigs[network.replace(/-fork$/, '')] || allConfigs.default;

  if (!config) {
    return;
  }
  let deploy = deployer;


  deploy = deploy  
    .then(() => {    
      return web3.eth.getBlockNumber();
    })
    .then((currentBlock) => {
      const startBlock = config.startBlock
          || web3.utils.toBN(currentBlock).add(web3.utils.toBN(config.lpfarm.delay));

      return deployer.deploy(
        SingleFarm,
        ERC20.address,
        web3.utils.toBN(config.singlestakefarm.rewardPerBlock),
        config.lpfarm.rewardBlocks,
        startBlock
      );
    });

    var singlefarmInstance

    if (config.singlestakefarm.fund) {
      deploy = deploy
        .then(() => { return SingleFarm.deployed(); })
        .then((lpfarm) => {
            singlefarmInstance = lpfarm
          return ERC20.at(ERC20.address);
        })
        .then((erc20Instance) => {
          return erc20Instance.approve(singlefarmInstance.address, web3.utils.toBN(config.singlestakefarm.fund));
        })
        .then(() => {
          return singlefarmInstance.fund(web3.utils.toBN(config.singlestakefarm.fund));
        });
    }

    config.singlestakefarm.list.forEach((token) => {
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
        return singlefarmInstance.add(
          token.allocPoint,
          token.address || LP.address,
          false
        );
      });
    });

    
    // var OutPut = require("../output.json");
    // OutPut.SingleStakeFarm = singlefarmInstance.address;
    // fs.writeFileSync('../output.json', JSON.stringify(OutPut));
};

