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
            const n1155 = await NFT1155.at("0xC7b7222270a66c1BE931199a63dca6A01a478fDD");
            const market = await Market.at("0x6007b3721B506d69Be2BE0483C49F0d81D59a87E");
            const nftfarm = await NFTFarm.at("0xED69fe0D3ED9c9086419D35B8C78A30F1e180370");
            const lockedfarm = await LockedStaking.at("0xD1109010A8296612f2047880c0Af5254031831DC")
            const singlefarm = await LPFarm.at("0xe9F806017FD66A4a31e752cfAA0A2920542D5baa")
            const rbt = await RBT.at("0x0ca329aCdd308a5bFa5DaDc8aB24ecaa234Ad22A")
            this.nftfarm = nftfarm
            this.n1155 = n1155
            this.market = market
            this.lockedfarm = lockedfarm
            this.rbt = rbt
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

        it('get apy of single', async () => {
            totalPoint = await this.singlefarm.totalAllocPoint()
            console.log(totalPoint)

            lpmock1 = await LPMock.at("0x36C9BF5972F67ff9Da359d65Ec60FefBcfe70948")
            bamock = await lpmock1.balanceOf(this.singlefarm.address)
            console.log(bamock)

            apy = await this.singlefarm.APYPercent(0)
            console.log(apy)
        })
    });
});


// MNEMONIC="sad title laptop daring opera drive drill polar middle tortoise fringe family"
