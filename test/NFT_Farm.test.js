const NFTFarm = artifacts.require('./NFTFarm.sol');
const ERC1155 = artifacts.require('./core/ERC1155Mock.sol');
const ERC20 = artifacts.require('./core/ERC20Mock.sol');
const NFT1155 = artifacts.require('./NFTMock.sol');
const { waitUntilBlock } = require('./helpers/tempo')(web3);
const NFT1 = 1, NFT1Weight = 10;
const NFT2 = 2, NFT2Weight = 10;
const NFT3 = 3, NFT3Weight = 20;

contract('Farm', ([owner, alice, bob, carl]) => {
    before(async () => {
        this.erc20 = await ERC20.new("Mock token", "MOCK", 0, 1000000);
        let balance = await this.erc20.balanceOf(owner);
        assert.equal(balance.valueOf(), 1000000);

        // this.nft = await NFT.new(10000);
        // this.nft2 = await NFT.new(10000);

        this.n1155 = await NFT1155.new("NFT1155", "NFTs", "")

        this.n1155.mint(owner, NFT1, 10000)
        this.n1155.mint(owner, NFT2, 5000)
        this.n1155.mint(owner, NFT3, 2000)

        const currentBlock = await web3.eth.getBlockNumber();
        this.startBlock = currentBlock + 100;

        this.farm = await NFTFarm.new(this.erc20.address, 100, 100, this.startBlock);
        this.farm.add(NFT1Weight, this.n1155.address, NFT1, false);
        // this.farm.add(NFT2Weight, this.n1155.address, NFT2, false);
        // this.farm.add(NFT3Weight, this.n1155.address, NFT3, false);

        await this.erc20.approve(this.farm.address, 10000);
        await this.farm.fund(10000);
    });

    before(async () => {

        const [balance1, balance2, balance3] = await Promise.all([
            this.n1155.balanceOf(owner, NFT1),
            this.n1155.balanceOf(owner, NFT2),
            this.n1155.balanceOf(owner, NFT3),
        ]);

        assert.equal(10000, balance1);
        assert.equal(5000, balance2);
        assert.equal(2000, balance3);

        await Promise.all([
            this.n1155.transferInternal(owner, alice, NFT1, 5000),
            this.n1155.transferInternal(owner, bob, NFT1, 500),
            this.n1155.transferInternal(owner, carl, NFT1, 2000),
        ]);

        const [balanceAlice, balanceBob, balanceCarl] = await Promise.all([
            this.n1155.balanceOf(alice, NFT1),
            this.n1155.balanceOf(bob, NFT1),
            this.n1155.balanceOf(carl, NFT1),
        ]);

        assert.equal(5000, balanceAlice);
        assert.equal(500, balanceBob);
        assert.equal(2000, balanceCarl);
    });

    before(async () => {
        await Promise.all([
            this.n1155.transferInternal(owner, alice, NFT2, 1000),
            this.n1155.transferInternal(owner, carl, NFT2, 800),
        ]);

        const [balanceAlice, balanceBob, balanceCarl] = await Promise.all([
            this.n1155.balanceOf(alice, NFT2),
            this.n1155.balanceOf(bob, NFT2),
            this.n1155.balanceOf(carl, NFT2),
        ]);
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
            assert.equal(poolInfo[0], this.n1155.address);
            assert.equal(poolInfo[1].words[0], NFT1);
            assert.equal(poolInfo[2].words[0], 10);

            const totalAllocPoint = await this.farm.totalAllocPoint();
            assert.equal(totalAllocPoint, 10);
        });

        it('holds 10,000 MOCK', async () => {
            const balance = await this.erc20.balanceOf(this.farm.address);
            assert.equal(balance, 10000)
        });

        it('will run for 50 blocks', async () => {
            const endBlock = await this.farm.endBlock();
            assert.equal(50, endBlock - this.startBlock);
        });
    });


    describe('before the start block', () => {
        before(async () => {
            await Promise.all([
                this.n1155.setApprovalForAll(this.farm.address, true, {from: alice}),
                this.n1155.setApprovalForAll(this.farm.address, true, {from: bob })
            ]);

            await Promise.all([
                this.farm.deposit(0, 1500, {from: alice}),
                this.farm.deposit(0, 500, {from: bob})
            ]);
        });

        it('allows participants to join', async () => {
            const balanceFarm = await this.n1155.balanceOf(this.farm.address, NFT1);
            assert.equal(2000, balanceFarm);

            const balanceAlice = await this.n1155.balanceOf(alice, NFT1);
            const depositAlice = await this.farm.deposited(0, alice);
            assert.equal(3500, balanceAlice);
            assert.equal(1500, depositAlice);

            const balanceBob = await this.n1155.balanceOf(bob, NFT1);
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
            assert.equal(1000 * 2, totalPending);
        });

        it('reserved 750 for alice and 250 for bob', async () => {
            const pendingAlice = await this.farm.pending(0, alice);
            assert.equal(750 * 2, pendingAlice); 

            const pendingBob = await this.farm.pending(0, bob);
            assert.equal(250 * 2, pendingBob);
        });
    });

    describe('with a 3th participant after 30 blocks', () => {
        before(async () => {
            await waitUntilBlock(10, this.startBlock + 28);

            await this.n1155.setApprovalForAll(this.farm.address, true, {from: carl});
            await this.farm.deposit(0, 2000, {from: carl});
        });

        it('has a total reward of 3000 MOCK pending', async () => {
            const totalPending = await this.farm.totalPending();
            assert.equal(3000 * 2, totalPending);
        });

        it('reserved 2250 for alice, 750 for bob, and nothing for carl', async () => {
            const pendingAlice = await this.farm.pending(0, alice);
            assert.equal(2250 * 2, pendingAlice);

            const pendingBob = await this.farm.pending(0, bob);
            assert.equal(750 * 2, pendingBob);

            const pendingCarl = await this.farm.pending(0, carl);
            assert.equal(0, pendingCarl);
        });
    });

    describe('when it receives more funds (8000 MOCK)', () => {
        before(async () => {
            await this.erc20.approve(this.farm.address, 18000);
            await this.farm.fund(18000);
        });

        it('runs for 180 blocks (80 more)', async () => {
            const endBlock = await this.farm.endBlock();
            assert.equal(180, endBlock - this.startBlock);
        });
    });

    describe('with an added lp token (for 25%) after 100 blocks', () => {
        before(async () => {
            await waitUntilBlock(10, this.startBlock + 99);
            await this.farm.add(NFT2Weight, this.n1155.address, NFT2, true);
        });

        it('has a total reward of 10000 MOCK pending', async () => {
            const totalPending = await this.farm.totalPending();
            assert.equal(10000 * 2, totalPending);
        });

        it('is initialized for the LP token 2', async () => {
            const poolLength = await this.farm.poolLength();
            assert.equal(2, poolLength);

            const poolInfo = await this.farm.poolInfo(1);
            assert.equal(poolInfo[0], this.n1155.address);
            assert.equal(poolInfo[2].words[0], NFT2Weight);

            const totalAllocPoint = await this.farm.totalAllocPoint();
            assert.equal(totalAllocPoint, 20);
        });

        it('reserved nothing for alice, 2450 for bob, and 1000 for carl', async () => {
            const pendingAlice = await this.farm.pending(0, alice);
            assert.equal(4875 * 2, pendingAlice);

            const pendingBob = await this.farm.pending(0, bob);
            assert.equal(1625 * 2, pendingBob);

            const pendingCarl = await this.farm.pending(0, carl);
            assert.equal(3500 * 2, pendingCarl);
        });
    });

    describe('with 1st participant for lp2 after 110 blocks', () => {
        before(async () => {
            await waitUntilBlock(10, this.startBlock + 109);
            
            // await this.lp2.approve(this.farm.address, 500, { from: carl });
            await this.farm.deposit(1, 500, {from: carl});
        });

        it('holds 4000 LP for the participants', async () => {
            const balanceFarm = await this.n1155.balanceOf(this.farm.address, NFT1);
            assert.equal(4000, balanceFarm);

            const depositAlice = await this.farm.deposited(0, alice);
            assert.equal(1500, depositAlice);

            const depositBob = await this.farm.deposited(0, bob);
            assert.equal(500, depositBob);

            const depositCarl = await this.farm.deposited(0, carl);
            assert.equal(2000, depositCarl);
        });

        it('holds 500 LP2 for the participants', async () => {
            const balanceFarm = await this.n1155.balanceOf(this.farm.address, NFT2);
            assert.equal(500, balanceFarm);

            const depositAlice = await this.farm.deposited(1, alice);
            assert.equal(0, depositAlice);

            const depositBob = await this.farm.deposited(1, bob);
            assert.equal(0, depositBob);

            const depositCarl = await this.farm.deposited(1, carl);
            assert.equal(500, depositCarl);
        });

        it('has a total reward of 11000 MOCK pending', async () => {
            const totalPending = await this.farm.totalPending();
            assert.equal(21000, totalPending);
        });

        it('reserved 50% for LP (37/12/50 bob/carl)', async () => {
            const pendingAlice = await this.farm.pending(0, alice);
            assert.equal(4875 * 2 + 187, pendingAlice);

            const pendingBob = await this.farm.pending(0, bob);
            assert.equal(1625 * 2 + 62, pendingBob);

            const pendingCarl = await this.farm.pending(0, carl);
            assert.equal(3500 * 2 + 250, pendingCarl);
        });

        it('reserved 50% for NFT2 (not rewarded) -> 500 MOCK inaccessible', async () => {
            const pendingAlice = await this.farm.pending(1, alice);
            assert.equal(0, pendingAlice);

            const pendingBob = await this.farm.pending(1, bob);
            assert.equal(0, pendingBob);

            const pendingCarl = await this.farm.pending(1, carl);
            assert.equal(0, pendingCarl);
        });
    });
    describe('', () => {
        it('holds 4000 NFT1 for the participants', async () => {
            const balanceFarm = await this.n1155.balanceOf(this.farm.address, NFT1);
            assert.equal(4000, balanceFarm);

            const depositAlice = await this.farm.deposited(0, alice);
            assert.equal(1500, depositAlice);
    
            const depositBob = await this.farm.deposited(0, bob);
            assert.equal(500, depositBob);
    
            const depositCarl = await this.farm.deposited(0, carl);
            assert.equal(2000, depositCarl);
        });
    
        it('holds 500 NFT2 for the participants', async () => {
            const balanceFarm = await this.n1155.balanceOf(this.farm.address, NFT2);
            assert.equal(500, balanceFarm);
    
            const depositAlice = await this.farm.deposited(1, alice);
            assert.equal(0, depositAlice);
    
            const depositCarl = await this.farm.deposited(1, carl);
            assert.equal(500, depositCarl);
        });
    })
    describe('withdraw 500 NFT2 for the participants', async () => {
        before(async () => {
            await waitUntilBlock(10, this.startBlock + 119);
            await this.farm.withdraw(0, 500, {from: alice});
        });
        it('gives alice 1250 MOCK and 1000 LP2', async () => {
            const balanceERC20 = await this.erc20.balanceOf(alice);
            assert.equal(10125, balanceERC20);

            const balanceNFT1 = await this.n1155.balanceOf(alice, NFT1);
            assert.equal(4000, balanceNFT1);

            const balanceNFT2 = await this.n1155.balanceOf(alice, NFT2);
            assert.equal(1000, balanceNFT2);
        });
    });
    
});