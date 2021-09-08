const NFT1155 = artifacts.require('./token/NFT1155.sol');
const Market = artifacts.require('./Market.sol')
const NFTFarm = artifacts.require('./NFTFarm.sol')

contract('NFT1155', ([owner]) => {
    describe('', () => {
        before(async () => {
            const n1155 = await NFT1155.at("0xC7b7222270a66c1BE931199a63dca6A01a478fDD");
            const market = await Market.at("0x6007b3721B506d69Be2BE0483C49F0d81D59a87E");
            const nftfarm = await NFTFarm.at("0xED69fe0D3ED9c9086419D35B8C78A30F1e180370");
            this.nftfarm = nftfarm
            this.n1155 = n1155
            this.market = market
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

        it('', async () => {
            console.log(owner)
            await this.n1155.setApprovalForAll(this.nftfarm.address, true, {from: owner}),
            ba = await this.n1155.balanceOf(owner, 1)
            assert.equal(ba, 1)
            this.nftfarm.deposit(0, 1, {from: owner}),
            ba = await this.n1155.balanceOf(owner, 1)
            assert.equal(ba, 0)
        });

        // it('', async () => {
        //     console.log(owner)
        //     await this.n1155.setApprovalForAll(this.nftfarm.address, true, {from: owner}),
        //     ba = await this.n1155.balanceOf(owner, 1)
        //     assert.equal(ba, 1)
        //     this.nftfarm.deposit(0, 1, {from: owner}),
        //     ba = await this.n1155.balanceOf(owner, 1)
        //     assert.equal(ba, 0)
        // });
    });
});


// MNEMONIC="sad title laptop daring opera drive drill polar middle tortoise fringe family"
