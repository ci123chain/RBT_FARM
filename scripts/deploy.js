const Web3 = require('web3');
const fs = require('fs')
//const web3 = new Web3('https://data-seed-prebsc-2-s1.binance.org:8545'); /// [Note]: Endpoing is the BSC testnet (original)
//const provider = new Web3.providers.HttpProvider('https://data-seed-prebsc-2-s1.binance.org:8545');  /// [Note]: 503 Error
// const provider = new Web3.providers.HttpProvider('https://localhost:8545');    /// [Note]: New RPC Endpoint
// const web3 = new Web3(provider);

const RBT = artifacts.require("./token/RBT.sol");
const LPFarm = artifacts.require("./LPFarm.sol");
const LP = artifacts.require('./mock/LPMock.sol');
const LockedStaking = artifacts.require("./LockedStaking.sol");
const NFT1155 = artifacts.require("./token/NFT1155.sol");
const NFTFarm = artifacts.require("./NFTFarm.sol");
const Market = artifacts.require("./Market.sol");


const allConfigs = require("../config.json");
const config = allConfigs.default;



let currentAddr;

var RBTTokenAddr;
var LPFarmAddr;
var SingleStakingFarmAddr;
var LockedStakeFarmAddr;
var NFT1155Addr;
var NFTFarmAddr;
var MarketAddr;

let rbtTokenIns;
let lpFarmIns;
let singleStakeFarmIns;
let lockedStakeFarmIns;
let nft1155Ins;
let nftFarmIns;
let marketIns;


async function deployRBT() {
    erc20config = config.erc20;
    rbtTokenIns = await RBT.new(erc20config.name,
        erc20config.symbol,
        erc20config.decimals,
        web3.utils.toBN(erc20config.supply));
    RBTTokenAddr = rbtTokenIns.address
}

async function deployLPFarm() {
    const currentBlock = await getCurrentBlock();
    const startBlock = web3.utils.toBN(currentBlock).add(web3.utils.toBN(config.lpfarm.delay))
    lpFarmIns = await LPFarm.new(RBTTokenAddr, web3.utils.toBN(config.lpfarm.rewardPerBlock),  web3.utils.toBN(config.lpfarm.rewardBlocks), startBlock)
    LPFarmAddr = lpFarmIns.address

    if (config.lpfarm.fund) {
        await rbtTokenIns.approve(lpFarmIns.address, web3.utils.toBN(config.lpfarm.fund));
        await lpFarmIns.fund(web3.utils.toBN(config.lpfarm.fund));
    }

    for (index in config.lpfarm.list) {
        const token = config.lpfarm.list[index]
        var lpMock
        if (!token.address) {
            lpMock = await LP.new(token.name, token.symbol, token.decimals)
            const amount = web3.utils.toBN(10).pow(web3.utils.toBN(token.decimals)).mul(web3.utils.toBN(1000));
            await lpMock.mint(currentAddr, amount);
        }
        await lpFarmIns.add(token.allocPoint, token.address || lpMock.address, false);
        console.log("Deploy mock lp ", lpMock.address)
    }
}

async function singleStakeFarm() {
    const currentBlock = await getCurrentBlock();
    const startBlock = web3.utils.toBN(currentBlock).add(web3.utils.toBN(config.singlestakefarm.delay))
    singleStakeFarmIns = await LPFarm.new(RBTTokenAddr, web3.utils.toBN(config.singlestakefarm.rewardPerBlock),  web3.utils.toBN(config.singlestakefarm.rewardBlocks), startBlock)
    SingleStakingFarmAddr = singleStakeFarmIns.address

    if (config.singlestakefarm.fund) {
        console.log("Fund to SingleStakeFarm ", config.singlestakefarm.fund)

        await rbtTokenIns.approve(singleStakeFarmIns.address, web3.utils.toBN(config.singlestakefarm.fund));
        await singleStakeFarmIns.fund(web3.utils.toBN(config.singlestakefarm.fund));
    }

    for (index in config.singlestakefarm.list) {
        const token = config.singlestakefarm.list[index]
        var lpMock
        if (!token.address) {
            lpMock = await LP.new(token.name, token.symbol, token.decimals)
            const amount = web3.utils.toBN(10).pow(web3.utils.toBN(token.decimals)).mul(web3.utils.toBN(1000));
            await lpMock.mint(currentAddr, amount);
        }
        await singleStakeFarmIns.add(token.allocPoint, token.address || lpMock.address, false);
        console.log("Deploy mock singlestake ", lpMock.address)
    }
}

async function lockedStakeFarm() {
    if (!SingleStakingFarmAddr || !RBTTokenAddr) {
        console.log("unlockedAddr or RBTTokenAddr should not be empty");
        return
    }
    lockedStakeFarmIns = await LockedStaking.new(RBTTokenAddr, SingleStakingFarmAddr)
    LockedStakeFarmAddr = lockedStakeFarmIns.address
    await rbtTokenIns.approve(LockedStakeFarmAddr, web3.utils.toBN(config.lockstakefarm.fund));

    for (index in config.lockstakefarm.list) {
        const pool = config.lockstakefarm.list[index]
        await lockedStakeFarmIns.add(pool.days, pool.rate);
        console.log("Add to pool with days: ", pool.days, " rate: ", pool.rate)
    }
}

async function deployNFT() {
    nft1155Ins = await NFT1155.new("RBT_NFT1155", "NFT1155", RBTTokenAddr, "")

    NFT1155Addr = nft1155Ins.address
    
    for (index in config.erc1155) {
        const nft = config.erc1155[index]
        await nft1155Ins.addToken(nft.name, nft.balance, nft.weeklyMintAmount, nft.weeklyMintDiscount, nft.period, nft.ipfsUrl, web3.utils.toBN(nft.price))
        await nft1155Ins.mintFor(nft.index)
        console.log("Add NFT Token ", nft.name)
    }
}

async function deployNFTFarm() {
    const currentBlock = await getCurrentBlock();
    const startBlock = web3.utils.toBN(currentBlock).add(web3.utils.toBN(config.nftfarm.delay))
    nftFarmIns =  await NFTFarm.new(RBTTokenAddr, config.nftfarm.rewardPerBlock, config.nftfarm.rewardBlocks, startBlock)
    NFTFarmAddr = nftFarmIns.address

    if (config.nftfarm.fund) {
        console.log("Fund to NFTFarm ", config.nftfarm.fund)
        await rbtTokenIns.approve(NFTFarmAddr, web3.utils.toBN(config.nftfarm.fund));
        await nftFarmIns.fund(web3.utils.toBN(config.nftfarm.fund));
    }

    for (index in config.nftfarm.list) {
        const token = config.nftfarm.list[index]
        await nftFarmIns.add(token.allocPoint, NFT1155Addr, token.index, false);
        console.log("Add to NFTFarm ", NFT1155Addr)
    }
}

async function deployMarket() {
    marketIns = await Market.new(RBTTokenAddr, NFT1155Addr)
    await nft1155Ins.setApprovalForAll(marketIns.address, true);
    
    MarketAddr = marketIns.address
}


async function getCurrentBlock() {
    const currentBlock = await web3.eth.getBlockNumber();
    return currentBlock;
}

async function checkStateInAdvance() {
    /// Assign addresses into global variables of wallets
    // deployer = process.env.DEPLOYER_WALLET;
    // admin = process.env.ADMIN_WALLET;
    // console.log('=== deployer (staker) ===', deployer);
    // console.log('=== admin ===', admin);

    const accounts = await web3.eth.getAccounts()
    currentAddr = accounts[0]
    console.log('=== deployer (staker) ===', currentAddr);
}

/// [Note]: For truffle exec (Remarks: Need to use module.exports)
module.exports = function(callback) {
    main().then(() => callback()).catch(err => callback(err));
};

async function main() {

    let { unlockAddress, rbt } = require('yargs')
    .option('unlock', { alias: 'unlockAddress', describe: 'unlockstaking string', type: 'string' })
    .option('rbt', { alias: 'rbtAddress', describe: 'rbt address string', type: 'string' })
    .parse()

    if (unlockAddress && unlockAddress.length > 0) {
        SingleStakingFarmAddr = unlockAddress
        RBTTokenAddr = rbt
        rbtTokenIns = await RBT.at(RBTTokenAddr)
        console.log("\n------------- Deploying LockedStaking start-------------");
        console.log("Unlock Address:", SingleStakingFarmAddr);
        console.log("RBT Address:", RBTTokenAddr);
        
        await lockedStakeFarm();
        console.log("LockedStaking: ", LockedStakeFarmAddr);
        return
    }
    
    console.log("\n------------- Check state in advance -------------");
    await checkStateInAdvance();

    console.log("\n------------- Deploying RBT start-------------");
    await deployRBT();
    console.log("RBT: ", RBTTokenAddr);

    console.log("\n------------- Deploying LPFarm start-------------");
    await deployLPFarm();
    console.log("LPFarm: ", LPFarmAddr);

    console.log("\n------------- Deploying SingleStaking start-------------");
    await singleStakeFarm();
    console.log("SingleStaking: ", SingleStakingFarmAddr);

    
 
    console.log("\n------------- Deploying NFT1155 start-------------");
    await deployNFT();
    console.log("NFT1155: ", NFT1155Addr);

    console.log("\n------------- Deploying NFTFarm start-------------");
    await deployNFTFarm();
    console.log("NFTFarm: ", NFTFarmAddr);

    console.log("\n------------- Deploying Market start-------------");
    await deployMarket();
    console.log("Market: ", MarketAddr);

    const output = {
        "RBT": RBTTokenAddr,
        "LPFarm": LPFarmAddr,
        "SingleStakingFarm": SingleStakingFarmAddr,
        // "LockedStakingFarm": LockedStakeFarmAddr,
        "NFT1155": NFT1155Addr,
        "NFTFarm": NFTFarmAddr,
        "Market": MarketAddr
    }


    try {
        fs.writeFileSync('./output.json', JSON.stringify(output))
    } catch (err) {
        console.error(err)
    }
}