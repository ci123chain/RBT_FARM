const NFT1155 = artifacts.require('./ERC1155/NFT1155.sol');
const Market = artifacts.require('./Market.sol')
const ERC20 = artifacts.require('./mock/ERC20Mock.sol');
const { waitUntilBlock } = require('./helpers/tempo')(web3);
const NFT1 = 1, NFT1Weight = 10;
const NFT2 = 2, NFT2Weight = 10;

contract('NFT1155', ([owner, alice, bob, carl]) => {
    before(async () => {
        this.erc20 = await ERC20.new("Mock token", "MOCK", 0, 1000000);
        let balance = await this.erc20.balanceOf(owner);
        assert.equal(balance.valueOf(), 1000000);
        this.n1155 = await NFT1155.new("NFT1155", "NFTs", "");
        this.market = await Market.new(this.erc20.address, this.n1155.address);
    });


    describe("Test Mint for NFT1", () => {
        before("add token NFT1 ", async() => {
            // 5s
            await this.n1155.addToken("NFT1", 5000, 20, 5) 
        });

        it('0 balance of alice', async () => {
            balanceAlice = await this.n1155.balanceOf(alice, NFT1);
            assert.equal(balanceAlice, 0)
        });
        it('initial mint', async () => {
            await this.n1155.mintFor(alice, NFT1);
            assert.equal(balanceAlice, 0)
        });
        it('5000 balance of alice', async () => {
            balanceAlice = await this.n1155.balanceOf(alice, NFT1);
            assert.equal(balanceAlice, 5000)
        });
        it('5000 balance of alice for mint again', async () => {
            await this.n1155.mintFor(alice, NFT1);
            assert.equal(balanceAlice, 5000)
        });
        
    });

    describe("Market test case", ()=> {
        it('open unexist trade', async () => {
            try {
                balanceBob = await this.market.openTrade(1);
            } catch(e) {
                return
            }
            assert.fail('open unexist trade should failed');
        });

        it('new trade will failed without approved', async () => {
            try {
                await this.market.newTrade(NFT1, 500, 1800, {from: alice});
            } catch(e) {
                return
            }
            assert.fail('trade should failed');
        });

        it('new trade will success', async () => {
            await this.n1155.setApprovalForAll(this.market.address, true, {from: alice});
            await this.market.newTrade(NFT1, 500, 1800, {from: alice});
        });

        it('4500 balance of alice', async () => {
            balanceAlice = await this.n1155.balanceOf(alice, NFT1);
            assert.equal(balanceAlice, 4500)
            balanceC = await this.n1155.balanceOf(this.market.address, NFT1);
            assert.equal(balanceC, 500)
        });

        it('bob buy nft1 from alice of trade 1', async () => {
            await this.erc20.transfer(bob, 2000);
            balanceBob = await this.erc20.balanceOf(bob);
            assert.equal(balanceBob, 2000)

            await this.erc20.approve(this.market.address, 1800, {from: bob})
            await this.market.bugNFT(0, {from: bob});
            balanceAlice = await this.erc20.balanceOf(alice);
            assert.equal(balanceAlice, 1800)

            balanceBob = await this.erc20.balanceOf(bob);
            assert.equal(balanceBob, 200)

            balanceBobN = await this.n1155.balanceOf(bob, NFT1);
            assert.equal(balanceBobN, 500)
        });
    });


    describe("", () => {
        it('0 balance of bob', async () => {
            balanceBob = await this.n1155.balanceOf(bob, NFT2);
            assert.equal(balanceBob, 0)
        });
        it('NFT not added', async () => {
            try {
                await this.n1155.mintFor(alice, NFT2);
            } catch(e) {
                return
            }
            assert.fail('fund successful');
        });
        it('add NFT2', async () => {
            await this.n1155.addToken("NFT2", 1000, 20, 10) 

            balanceBob = await this.n1155.balanceOf(bob, NFT2);
            assert.equal(balanceBob, 0)
        });
        it('mint NFT2', async () => {
            await this.n1155.mintFor(carl, NFT2) 
            balanceCarl = await this.n1155.balanceOf(carl, NFT2);
            assert.equal(balanceCarl, 1000)
        });

        it('transfer 200 NFT2 from carl to alice', async () => {

            await this.n1155.transferFrom(carl, alice, NFT2, 200, {from: carl});
            balanceCarl = await this.n1155.balanceOf(carl, NFT2);
            assert.equal(balanceCarl, 800)

            balanceAlice = await this.n1155.balanceOf(alice, NFT2);
            assert.equal(balanceAlice, 200)
        });
    });

    describe("delay for mint", () => {
        it('9000 balance of alice for mint again after sleep 6s', async () => {
            await sleep(6);
            await this.n1155.mintFor(alice, NFT1);
            balanceAlice = await this.n1155.balanceOf(alice, NFT1);
            assert.equal(balanceAlice, 9000)
        });

        it('14760 balance of alice for mint again after sleep 16s', async () => {
            await sleep(11);
            await this.n1155.mintFor(alice, NFT1);
            balanceAlice = await this.n1155.balanceOf(alice, NFT1);
            assert.equal(balanceAlice, 14760)
        });
    });
});

function sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time * 1000));
}