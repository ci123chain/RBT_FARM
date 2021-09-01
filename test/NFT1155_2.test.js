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
        this.n1155 = await NFT1155.new("NFT1155", "NFTs", "");
        this.market = await Market.new(this.erc20.address, this.n1155.address);
    });


    describe("Test Mint for NFT1", () => {
        before("add token NFT1 ", async() => {
            // 5s
            await this.n1155.addToken("NFT1", 10000, 1500, 90, 5, "123456") // 10s mint 1500, 90% discount per week
        });

        it('0 balance of alice', async () => {
            balanceAlice = await this.n1155.balanceOf(alice, NFT1);
            assert.equal(balanceAlice, 0)
        });
        it('initial mint', async () => {
            await this.n1155.mintFor(NFT1);
        });
        it('11500 balance of alice', async () => {
            balanceOwner = await this.n1155.balanceOf(owner, NFT1);
            assert.equal(balanceOwner, 11500)
        });
        it('11500 balance of alice for mint again', async () => {
            await this.n1155.mintFor(NFT1);
            balanceOwner = await this.n1155.balanceOf(owner, NFT1);
            assert.equal(balanceOwner, 11500)
        });
        it("ipfsdata of nft", async ()=> {
            url = await this.n1155.ipfsData(NFT1);
            assert.equal(url, "123456")
        })
        
    });

   
    describe("delay for mint first step ", () => {
        it('13000 balance of owner for mint again after sleep 6s', async () => {
            await sleep(6);
            await this.n1155.mintFor(NFT1);
            balanceAlice = await this.n1155.balanceOf(owner, NFT1);
            assert.equal(balanceAlice, 13000)
        });


        it('16000 balance of owner for mint again after sleep 10s', async () => {
            await sleep(10);
            await this.n1155.mintFor(NFT1);
            balanceAlice = await this.n1155.balanceOf(owner, NFT1);
            assert.equal(balanceAlice, 16000)
        });

        it('17500 balance of owner for mint again after sleep 5s', async () => {
            await sleep(5);
            await this.n1155.mintFor(NFT1);
            balanceAlice = await this.n1155.balanceOf(owner, NFT1);
            assert.equal(balanceAlice, 17500)
        });
        it('19000 balance of owner for mint again after sleep 5s', async () => {
            await sleep(5);
            await this.n1155.mintFor(NFT1);
            balanceAlice = await this.n1155.balanceOf(owner, NFT1);
            assert.equal(balanceAlice, 19000)
        });

        it('20500 balance of owner for mint again after sleep 5s', async () => {
            await sleep(5);
            await this.n1155.mintFor(NFT1);
            balanceAlice = await this.n1155.balanceOf(owner, NFT1);
            assert.equal(balanceAlice, 20500)
        });

    });

    describe("delay for mint second step ", () => {
        it('21850 balance of owner for mint again after sleep 5s', async () => {
            await sleep(5);
            await this.n1155.mintFor(NFT1);
            balanceAlice = await this.n1155.balanceOf(owner, NFT1);
            assert.equal(balanceAlice, 21850)
        });

        it('21850 + 1350 balance of owner for mint again after sleep 6s', async () => {
            await sleep(5);
            await this.n1155.mintFor(NFT1);
            balanceAlice = await this.n1155.balanceOf(owner, NFT1);
            assert.equal(balanceAlice, 23200)
        });
    });
});

function sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time * 1000));
}