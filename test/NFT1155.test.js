const NFT1155 = artifacts.require('./token/NFT1155.sol');
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
        this.n1155 = await NFT1155.new("NFT1155", "NFTs", this.erc20.address, "");
        this.market = await Market.new(this.erc20.address, this.n1155.address);
    });


    describe("Test Mint for NFT1", () => {
        before("add token NFT1 ", async() => {
            // 5s
            await this.n1155.addToken("NFT1", 5000, 500, 80, 5, "123456", web3.utils.toBN("9900"))
        });

        it('0 balance of alice', async () => {
            balanceAlice = await this.n1155.balanceOf(alice, NFT1);
            assert.equal(balanceAlice, 0)
        });
        it('initial mint', async () => {
            await this.n1155.mintFor(NFT1);
        });
        it('5500 balance of Owner', async () => {
            balanceOwner = await this.n1155.balanceOf(owner, NFT1);
            assert.equal(balanceOwner, 5500)
        });
        it('5500 balance of alice for mint again', async () => {
            await this.n1155.mintFor(NFT1);
            balanceOwner = await this.n1155.balanceOf(owner, NFT1);
            assert.equal(balanceOwner, 5500)
        });
        it("ipfsdata of nft", async ()=> {
            url = await this.n1155.ipfsData(NFT1);
            assert.equal(url, "123456")
        })
        
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
                await this.market.newTrade(NFT1, 500, 1800, {from: owner});
            } catch(e) {
                return
            }
            assert.fail('trade should failed');
        });

        it('new trade will success', async () => {
            await this.n1155.setApprovalForAll(this.market.address, true, {from: owner});
            await this.market.newTrade(NFT1, 500, 1800, {from: owner});
        });

        it('5000 balance of alice', async () => {
            balanceAlice = await this.n1155.balanceOf(owner, NFT1);
            assert.equal(balanceAlice, 5000)
            balanceC = await this.n1155.balanceOf(this.market.address, NFT1);
            assert.equal(balanceC, 500)
        });

        it('bob buy nft1 from alice of trade 1', async () => {
            await this.erc20.transfer(bob, 2000);
            balanceBob = await this.erc20.balanceOf(bob);
            assert.equal(balanceBob, 2000)

            await this.erc20.approve(this.market.address, 1800, {from: bob})
            await this.market.bugNFT(0, {from: bob});
            balanceOwner = await this.erc20.balanceOf(owner);
            assert.equal(balanceOwner, 1800 + 998000)

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
                await this.n1155.mintFor(NFT2);
            } catch(e) {
                return
            }
            assert.fail('mint successful');
        });
        it('add NFT2', async () => {
            await this.n1155.addToken("NFT2", 1000, 200, 60, 10, "67890", web3.utils.toBN("19900")) 

            balanceOwner = await this.n1155.balanceOf(owner, NFT2);
            assert.equal(balanceOwner, 1200)
        });
        it('carl mint NFT2', async () => {
            await this.n1155.mintFor(NFT2) 
            balanceCarl = await this.n1155.balanceOf(owner, NFT2);
            assert.equal(balanceCarl, 1200)
        });

        it('transfer 200 NFT2 from carl to alice', async () => {

            await this.n1155.transferFrom(owner, alice, NFT2, 200);
            balanceCarl = await this.n1155.balanceOf(owner, NFT2);
            assert.equal(balanceCarl, 1000)

            balanceAlice = await this.n1155.balanceOf(alice, NFT2);
            assert.equal(balanceAlice, 200)
        });
    });

    describe("delay for mint", () => {
        it('5500 balance of alice for mint again after sleep 6s', async () => {
            await sleep(6);
            await this.n1155.mintFor(NFT1);
            balanceowner = await this.n1155.balanceOf(owner, NFT1);
            assert.equal(balanceowner, 5500)
        });

        it('6500 balance of alice for mint again after sleep 16s', async () => {
            await sleep(11);
            await this.n1155.mintFor(NFT1);
            balanceowner = await this.n1155.balanceOf(owner, NFT1);
            assert.equal(balanceowner, 6500)
        });
    });
});

function sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time * 1000));
}