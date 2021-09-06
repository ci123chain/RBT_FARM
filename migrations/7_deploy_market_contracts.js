const allConfigs = require("../config.json");
const ERC20 = artifacts.require("./token/RBT.sol");
const Market = artifacts.require("./Market.sol");
const NFT1155 = artifacts.require("./token/NFT1155.sol");


module.exports = function(deployer, network, addresses) {
  deploy = deployer;
// market
  deploy = deploy.then(()=> {
    return deployer.deploy(
      Market,
      ERC20.address,
      NFT1155.address,
    )
  }).then(() => {return Market.deployed(); });


  // var OutPut = require("../output.json");
  // OutPut.Market = Market.address;
  // fs.writeFileSync('../output.json', JSON.stringify(OutPut));

  return deploy;
}