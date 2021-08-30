const NFTFarm = artifacts.require("./NFTFarm.sol");
const ERC20 = artifacts.require("./mock/ERC20Mock.sol");
const NFT1155 = artifacts.require("./token/NFT1155.sol");
const allConfigs = require("../config.json");

module.exports = function(deployer, network, addresses) {
  const config = allConfigs[network.replace(/-fork$/, '')] || allConfigs.default;
  if (!config) {
    return;
  }

  let deploy = deployer;
  // NFT1155
  deploy = deploy.then(()=> {
    return deployer.deploy(
      NFT1155,
      "NFT1155",
      "NFT1155",
      ""
    )
  }).then(() => {
    return NFT1155.deployed(); 
  });

  config.erc1155.forEach((token) => {
    deploy = deploy.then(()=>{
      return NFT1155.at(NFT1155.address)
    }).then((nft1155) => {
      return nft1155.addToken(token.name, token.balance, token.weeklyDecline, token.period, token.ipfsUrl)
    }).then(()=>{
      return NFT1155.at(NFT1155.address)
    }).then((nft1155) => {
      return nft1155.mintFor(token.minter, token.index)
    })
  });


  // NFT Farm
  deploy = deploy.then(() => {    
    return web3.eth.getBlockNumber();
  }).then((blockNumber)=> {
    return deployer.deploy(
        NFTFarm,
        ERC20.address,
        config.nftfarm.rewardPerBlock,
        config.nftfarm.rewardBlocks,
        blockNumber + config.nftfarm.startBlockOffset,
    )
  }).then(() => {
    return NFTFarm.deployed();
  });

  config.nftfarm.list.forEach((item) => {
    deploy = deploy.then(() => {
      return NFTFarm.at(NFTFarm.address)
    }).then((nftfarm)=>{
      return nftfarm.add(item.weight, NFT1155.address, item.index, false);
    })
  });

}