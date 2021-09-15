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
            const n1155 = await NFT1155.at("0xB9897C2F5dB79b6492C13Fb26C0aAC2e13e96a8C");
            const market = await Market.at("0x3F1933aCb9821330B895962Cef16DEbBD541AFFA");
            const lpfarm = await LPFarm.at("0xE5d314C0026443836884D15A5a534805edb086b1")
            // const nftfarm = await NFTFarm.at("0xED69fe0D3ED9c9086419D35B8C78A30F1e180370");
            // const lockedfarm = await LockedStaking.at("0xD1109010A8296612f2047880c0Af5254031831DC")
            const singlefarm = await LPFarm.at("0x48cbab7FE2b29CC0dA6E4D86F39C7e6EB74e51ad")
            const rbt = await RBT.at("0x1367e2a9760dcd121f2c10929aa78dcf3d8efa78")
            // this.nftfarm = nftfarm
            this.n1155 = n1155
            this.market = market
            // this.lockedfarm = lockedfarm
            this.rbt = rbt
            this.lpfarm = lpfarm
            this.singlefarm = singlefarm
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

        // it('', async () => {
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
        // });

        // it('balance of owner usdt', async () => {
        //     usdtaddr = await this.market.erc20Instance()
        //     usdt = await RBT.at(usdtaddr)
        //     dec = await usdt.decimals()
        //     bal = await usdt.balanceOf(owner)
        //     console.log("balance of usdt ", bal.toString())

        //     const fund = web3.utils.toBN(10).pow(dec).div(web3.utils.toBN(10)).mul(web3.utils.toBN(99))
        //     await usdt.approve(this.market.address, fund)
        // });
        // it('', async () => {
        //     await this.market.mintOneNFT(1)
        //     bal = await this.n1155.balanceOf(owner, 1)
        //     console.log(bal)

        //     bal = await usdt.balanceOf(owner)
        //     console.log("balance of usdt ", bal.toString())
        // })

        it('', async () => {
            poolid = 2
            pool = await this.lpfarm.getPoolInfo(poolid)
            console.log(pool)

            usdtlp = await RBT.at(pool['0'])

            bal = await usdtlp.balanceOf(owner)
            console.log(bal.toString())
            
            bal = web3.utils.toBN("71999999999999999997750")
            // bal = web3.utils.toBN("1000")

            // await usdtlp.approve(this.lpfarm.address, bal);
            // await this.lpfarm.deposit(poolid, bal)
            await this.lpfarm.withdraw(poolid, bal)

            // bal = await usdtlp.balanceOf(owner)
            // console.log(bal.toString())
        })

    });
});


// MNEMONIC="sad title laptop daring opera drive drill polar middle tortoise fringe family"
