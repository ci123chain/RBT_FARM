const NFTFarm = artifacts.require("./NFTFarm.sol");
const ERC20 = artifacts.require("./token/RBT.sol");
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
      "RBT_NFT1155",
      "NFT1155",
      ERC20.address,
      ""
    )
  }).then(() => {
    return NFT1155.deployed(); 
  });

  config.erc1155.forEach((token) => {
    deploy = deploy.then(()=>{
      return NFT1155.at(NFT1155.address)
    }).then((nft1155) => {
      return nft1155.addToken(token.name, token.balance, token.weeklyMintAmount, token.weeklyMintDiscount, token.period, token.ipfsUrl, web3.utils.toBN(token.price))
    }).then(()=>{
      return NFT1155.at(NFT1155.address)
    }).then((nft1155) => {
      return nft1155.mintFor(token.index)
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
        blockNumber + config.nftfarm.delay,
    )
  }).then(() => {
    return NFTFarm.deployed();
  })

  var nftfarmInstance
  if (config.nftfarm.fund) {
    deploy = deploy
      .then(() => { return NFTFarm.at(NFTFarm.address); })
      .then((nftfarm) => {
        nftfarmInstance = nftfarm
        return ERC20.at(ERC20.address);
      })
      .then((erc20Instance) => {
        return erc20Instance.approve(nftfarmInstance.address, web3.utils.toBN(config.nftfarm.fund));
      })
      .then(() => {
        return nftfarmInstance.fund(web3.utils.toBN(config.nftfarm.fund));
      });
  }

  config.nftfarm.list.forEach((item) => {
    deploy = deploy.then(() => {
      return NFTFarm.at(NFTFarm.address)
    }).then((nftfarm)=>{
      return nftfarm.add(item.allocPoint, NFT1155.address, item.index, false);
    })
  });



  // var OutPut = require("../output.json");
  // OutPut.NFT1155 = NFT1155.address;
  // OutPut.NFTFarm = nftfarmInstance.address;  
  // fs.writeFileSync('../output.json', JSON.stringify(OutPut));
}