const NFTFarm = artifacts.require('./NFTFarm.sol');
const ERC20 = artifacts.require('./ERC20Mock.sol');
const NFT = artifacts.require('./NFTMock.sol');
const { waitUntilBlock } = require('./helpers/tempo')(web3);

contract('Farm', ([owner, alice, bob, carl]) => {
    before(async () => {
        this.erc20 = await ERC20.new("Mock token", "MOCK", 0, 1000000);
        let balance = await this.erc20.balanceOf(owner);
        assert.equal(balance.valueOf(), 1000000);

        this.nft = await NFT.new(10000);
        this.nft2 = await NFT.new(10000);

        const currentBlock = await web3.eth.getBlockNumber();
        this.startBlock = currentBlock + 100;

        this.farm = await NFTFarm.new(this.erc20.address, 100, this.startBlock);
        this.farm.add(15, this.nft.address, false);

        await this.erc20.approve(this.farm.address, 10000);
        await this.farm.fund(10000);
    });

    before(async () => {
        await Promise.all([
            this.nft.mint(alice, 5000),
            this.nft.mint(bob, 500),
            this.nft.mint(carl, 2000),
        ]);

        const [balanceAlice, balanceBob, balanceCarl] = await Promise.all([
            this.nft.balanceOf(alice, 1),
            this.nft.balanceOf(bob, 1),
            this.nft.balanceOf(carl, 1),
        ]);

        assert.equal(5000, balanceAlice);
        assert.equal(500, balanceBob);
        assert.equal(2000, balanceCarl);
    });

    before(async () => {
        await Promise.all([
            this.nft2.mint(alice, 1000),
            this.nft2.mint(carl, 800),
        ]);

        const [balanceAlice, balanceBob, balanceCarl] = await Promise.all([
            this.nft2.balanceOf(alice, 1),
            this.nft2.balanceOf(bob, 1),
            this.nft2.balanceOf(carl, 1),
        ]);
        console.log(balanceAlice, balanceBob, balanceCarl);
        assert.equal(1000, balanceAlice);
        assert.equal(0, balanceBob);
        assert.equal(800, balanceCarl);
    });


    describe('when created', () => {
        it('is linked to the Mock ERC20 token', async () => {
            const linked = await this.farm.erc20();
            assert.equal(linked, this.erc20.address);
        });

        it('is configured to reward 100 MOCK per block', async () => {
            const rewardPerBlock = await this.farm.rewardPerBlock();
            assert.equal(rewardPerBlock, 100);
        });

        it('is configured with the correct start block', async () => {
            const startBlock = await this.farm.startBlock();
            assert.equal(startBlock, this.startBlock);
        });

        it('is initialized for the LP token', async () => {
            const poolLength = await this.farm.poolLength();
            assert.equal(1, poolLength);

            const poolInfo = await this.farm.poolInfo(0);
            assert.equal(poolInfo[0], this.nft.address);
            assert.equal(poolInfo[1].words[0], 15);

            const totalAllocPoint = await this.farm.totalAllocPoint();
            assert.equal(totalAllocPoint, 15);
        });

        it('holds 10,000 MOCK', async () => {
            const balance = await this.erc20.balanceOf(this.farm.address);
            assert.equal(balance, 10000)
        });

        it('will run for 100 blocks', async () => {
            const endBlock = await this.farm.endBlock();
            assert.equal(100, endBlock - this.startBlock);
        });
    });


    describe('before the start block', () => {
        before(async () => {
            await Promise.all([
                this.nft.setApprovalForAll(this.farm.address, true, {from: alice}),
                this.nft.setApprovalForAll(this.farm.address, true, {from: bob })
            ]);

            await Promise.all([
                this.farm.deposit(0, 1500, {from: alice}),
                this.farm.deposit(0, 500, {from: bob})
            ]);
        });

        it('allows participants to join', async () => {
            const balanceFarm = await this.nft.balanceOf(this.farm.address, 1);
            assert.equal(2000, balanceFarm);

            const balanceAlice = await this.nft.balanceOf(alice, 1);
            const depositAlice = await this.farm.deposited(0, alice);
            assert.equal(3500, balanceAlice);
            assert.equal(1500, depositAlice);

            const balanceBob = await this.nft.balanceOf(bob, 1);
            const depositBob = await this.farm.deposited(0, bob);
            assert.equal(0, balanceBob);
            assert.equal(500, depositBob);
        });

        it('does not assign any rewards yet', async () => {
            const totalPending = await this.farm.totalPending();
            assert.equal(0, totalPending);
        });
    })

    describe('after 10 blocks of farming', () => {
        before(async () => {
            await waitUntilBlock(10, this.startBlock + 10);
        });

        it('has a total reward of 1000 MOCK pending', async () => {
            const totalPending = await this.farm.totalPending();
            assert.equal(1000, totalPending);
        });

        it('reserved 750 for alice and 250 for bob', async () => {
            const pendingAlice = await this.farm.pending(0, alice);
            assert.equal(750, pendingAlice);

            const pendingBob = await this.farm.pending(0, bob);
            assert.equal(250, pendingBob);
        });
    });

});