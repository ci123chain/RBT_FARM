const NFT1155 = artifacts.require('./token/NFT1155.sol');
const Market = artifacts.require('./Market.sol')
const NFTFarm = artifacts.require('./NFTFarm.sol')
const LPFarm = artifacts.require('./LPFarm.sol')
const LPMock = artifacts.require('./mock/LPMock.sol')
const LockedStaking = artifacts.require('./LockedStaking.sol')
const RBT = artifacts.require('./token/RBT.sol')
contract('NFT1155', ([owner]) => {
    describe('', () => {
        before(async () => {
            const n1155 = await NFT1155.at("0xaA9385E367B6C52a8512f2436b1032761BB0b764");
            const market = await Market.at("0x4e7Ac6E77b178BdF3bdF51EB7b0bb228F906051f");
            // const nftfarm = await NFTFarm.at("0xED69fe0D3ED9c9086419D35B8C78A30F1e180370");
            // const lockedfarm = await LockedStaking.at("0xD1109010A8296612f2047880c0Af5254031831DC")
            // const singlefarm = await LPFarm.at("0xe9F806017FD66A4a31e752cfAA0A2920542D5baa")
            const rbt = await RBT.at("0x646b41F0aDE4755a24fC0B83025c7B9e73735B23")
            // this.nftfarm = nftfarm
            this.n1155 = n1155
            this.market = market
            // this.lockedfarm = lockedfarm
            this.rbt = rbt
            
            // this.singlefarm = singlefarm
        });


        // it('0 balance of alice', async () => {
        //     await this.n1155.setApprovalForAll(market.address, true, {from: owner});
        //     isApprove = await this.n1155.isApprovedForAll(owner, this.market.address)
        //     assert.equal(isApprove, true)
        //     ba = await this.n1155.balanceOf(owner, 1)
        //     assert.equal(ba, 1)
        //     await this.market.newTrade(1, 1, 1800, {from: owner});
        //     ba = await this.n1155.balanceOf(owner, 1)
        //     assert.equal(ba, 0)
        // });

        // it('0 balance of alice', async () => {
        //     await this.market.cancelTrade(2, {from: owner});
        //     ba = await this.n1155.balanceOf(owner, 1)
        //     assert.equal(ba, 1)
        // });

        // it('set approve false', async () => {
        //     console.log(owner)
        //     await this.n1155.setApprovalForAll(this.market.address, true, {from: owner});
        //     isApprove = await this.n1155.isApprovedForAll(owner, this.market.address)
        //     assert.equal(isApprove, true)
        // });

        // it('', async () => {
        //     console.log(owner)
        //     await this.n1155.setApprovalForAll(this.nftfarm.address, true, {from: owner}),
        //     ba = await this.n1155.balanceOf(owner, 1)
        //     assert.equal(ba, 1)
        //     this.nftfarm.deposit(0, 1, {from: owner}),
        //     ba = await this.n1155.balanceOf(owner, 1)
        //     assert.equal(ba, 0)
        // });

        // it('', async () => {
        //     console.log(owner)
        //     await this.n1155.setApprovalForAll(this.nftfarm.address, true, {from: owner}),
        //     ba = await this.n1155.balanceOf(owner, 1)
        //     assert.equal(ba, 1)
        //     this.nftfarm.deposit(0, 1, {from: owner}),
        //     ba = await this.n1155.balanceOf(owner, 1)
        //     assert.equal(ba, 0)
        // });
        // it('', async () => {
        //     fund = 1000000
        //     await this.rbt.approve(this.lockedfarm.address, web3.utils.toBN(fund));
        //     await this.lockedfarm.fund(web3.utils.toBN(fund));
        // })
        // it('', async () => {
        //     lockba = await this.rbt.balanceOf(this.lockedfarm.address)
        //     console.log(lockba)

        //     const reward = await this.lockedfarm.calculateReward(10000, 0)
        //     console.log(reward)

        //     await this.lockedfarm.stake(0, 10000);
        // })

        // it('get apy of single', async () => {
        //     totalPoint = await this.singlefarm.totalAllocPoint()
        //     console.log(totalPoint)

        //     lpmock1 = await LPMock.at("0x36C9BF5972F67ff9Da359d65Ec60FefBcfe70948")
        //     bamock = await lpmock1.balanceOf(this.singlefarm.address)
        //     console.log(bamock)

        //     apy = await this.singlefarm.APYPercent(0)
        //     console.log(apy)
        // })

        it('', async () => {
            // usdtaddr = await this.market.erc20Instance()
            // usdt = await RBT.at(usdtaddr)
            // dec = await usdt.decimals()
            // console.log(dec)

            // bal = await usdt.balanceOf("0x55CA7bfdE29227D166b719Bc0FA7C0c7D2650528")
            // console.log(bal.toString())

            // rbtbal = await this.rbt.balanceOf("0x2EC8EBB0a8eAa40e4Ce620CF9f84A96dF68D4669")
            // console.log(rbtbal.toString())
            // lpmock1 = await LPMock.at("0x36C9BF5972F67ff9Da359d65Ec60FefBcfe70948")
            // bamock = await lpmock1.balanceOf(this.singlefarm.address)
            // console.log(bamock)

            // apy = await this.singlefarm.APYPercent(0)
            // console.log(apy)

            // await this.market.cancelTrade(4)

            // pool = await this.n1155.poolInfo(1)
            // console.log(pool)
            
        });

        it('', async () => {
            rbtdec = await this.rbt.decimals()
            const fund = web3.utils.toBN(10).pow(rbtdec).div(web3.utils.toBN(10)).mul(web3.utils.toBN(99))
            await this.rbt.approve(this.market.address, fund)
            await this.market.mintOneNFT(1)
            await this.rbt.approve(this.market.address, 0)

            bal = await this.n1155.balanceOf(owner, 1)
            console.log(bal)
        })
    });
});


// MNEMONIC="sad title laptop daring opera drive drill polar middle tortoise fringe family"
