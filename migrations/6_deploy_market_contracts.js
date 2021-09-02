const ERC20 = artifacts.require("./token/RBT.sol");
const Market = artifacts.require("./Market.sol");
const NFT1155 = artifacts.require("./token/NFT1155.sol");


module.exports = function(deployer, network, addresses) {
  let deploy = deployer;
// market
  deploy = deploy.then(()=> {
    return deployer.deploy(
      Market,
      ERC20.address,
      NFT1155.address,
    )
  }).then(() => {return Market.deployed(); });

  return deploy;
}