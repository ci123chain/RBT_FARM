const LPFarm = artifacts.require('./LPFarm.sol');
const ERC20 = artifacts.require('./mock/ERC20Mock.sol');
const LP = artifacts.require('./mock/LPMock.sol');
const { waitUntilBlock } = require('./helpers/tempo')(web3);

contract('LPFarm', ([owner, alice, bob, carl]) => {
    before(async () => {
        this.erc20 = await ERC20.new("Mock token", "MOCK", 0, 1000000);
        let balance = await this.erc20.balanceOf(owner);
        assert.equal(balance.valueOf(), 1000000);

        this.lp = await LP.new("LP Token", "LP", 0);
        this.lp2 = await LP.new("LP Token 2", "LP2", 0);

        const currentBlock = await web3.eth.getBlockNumber();
        this.startBlock = currentBlock + 100;

        this.farm = await LPFarm.new(this.erc20.address, 100, 100, this.startBlock);
        this.farm.add(15, this.lp.address, false);

        await this.erc20.approve(this.farm.address, 20000);
        await this.farm.fund(20000);
    });

    before(async () => {
        await Promise.all([
            this.lp.mint(alice, 5000),
            this.lp.mint(bob, 500),
            this.lp.mint(carl, 2000),
        ]);

        const [balanceAlice, balanceBob, balanceCarl] = await Promise.all([
            this.lp.balanceOf(alice),
            this.lp.balanceOf(bob),
            this.lp.balanceOf(carl),
        ]);

        assert.equal(5000, balanceAlice);
        assert.equal(500, balanceBob);
        assert.equal(2000, balanceCarl);
    });

    before(async () => {
        await Promise.all([
            this.lp2.mint(alice, 1000),
            this.lp2.mint(carl, 800),
        ]);

        const [balanceAlice, balanceBob, balanceCarl] = await Promise.all([
            this.lp2.balanceOf(alice),
            this.lp2.balanceOf(bob),
            this.lp2.balanceOf(carl),
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
            assert.equal(poolInfo[0], this.lp.address);
            assert.equal(poolInfo[1].words[0], 15);

            const totalAllocPoint = await this.farm.totalAllocPoint();
            assert.equal(totalAllocPoint, 15);
        });

        it('holds 20,000 MOCK', async () => {
            const balance = await this.erc20.balanceOf(this.farm.address);
            assert.equal(balance, 20000)
        });

        it('will run for 100 blocks', async () => {
            const endBlock = await this.farm.endBlock();
            assert.equal(100, endBlock - this.startBlock);
        });
    });

    describe('before the start block', () => {
        before(async () => {
            await Promise.all([
                this.lp.approve(this.farm.address, 1500, { from: alice }),
                this.lp.approve(this.farm.address, 500, { from: bob })
            ]);

            await Promise.all([
                this.farm.deposit(0, 1500, {from: alice}),
                this.farm.deposit(0, 500, {from: bob})
            ]);
        });

        it('allows participants to join', async () => {
            const balanceFarm = await this.lp.balanceOf(this.farm.address);
            assert.equal(2000, balanceFarm);

            const balanceAlice = await this.lp.balanceOf(alice);
            const depositAlice = await this.farm.deposited(0, alice);
            assert.equal(3500, balanceAlice);
            assert.equal(1500, depositAlice);

            const balanceBob = await this.lp.balanceOf(bob);
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

        it('has a total reward of 2000 MOCK pending', async () => {
            const totalPending = await this.farm.totalPending();
            assert.equal(2000, totalPending);
        });

        it('reserved 1500 for alice and 500 for bob', async () => {
            const pendingAlice = await this.farm.pending(0, alice);
            assert.equal(1500, pendingAlice);

            const pendingBob = await this.farm.pending(0, bob);
            assert.equal(500, pendingBob);
        });
    });

    describe('with a 3th participant after 30 blocks', () => {
        before(async () => {
            await waitUntilBlock(10, this.startBlock + 28);

            await this.lp.approve(this.farm.address, 2000, { from: carl });
            await this.farm.deposit(0, 2000, {from: carl});
        });

        it('has a total reward of 6000 MOCK pending', async () => {
            const totalPending = await this.farm.totalPending();
            assert.equal(6000, totalPending);
        });

        it('reserved 4500 for alice, 1500 for bob, and nothing for carl', async () => {
            const pendingAlice = await this.farm.pending(0, alice);
            assert.equal(4500, pendingAlice);

            const pendingBob = await this.farm.pending(0, bob);
            assert.equal(1500, pendingBob);

            const pendingCarl = await this.farm.pending(0, carl);
            assert.equal(0, pendingCarl);
        });
    });

    describe('after 50 blocks of farming', () => {
        before(async () => {
            await waitUntilBlock(10, this.startBlock + 50);
        });

        it('has a total reward of 10000 MOCK pending', async () => {
            const totalPending = await this.farm.totalPending();
            assert.equal(10000, totalPending);
        });

        it('reserved 6000 for alice, 2000 for bob, and 2000 for carl', async () => {
            const pendingAlice = await this.farm.pending(0, alice);
            assert.equal(6000, pendingAlice);

            const pendingBob = await this.farm.pending(0, bob);
            assert.equal(2000, pendingBob);

            const pendingCarl = await this.farm.pending(0, carl);
            assert.equal(2000, pendingCarl);
        });
    });

    describe('with a participant withdrawing after 70 blocks', () => {
        before(async () => {
            await waitUntilBlock(10, this.startBlock + 69);
            await this.farm.withdraw(0, 1500, {from: alice});
        });

        it('gives alice 7500 MOCK and 5000 LP', async () => {
            const balanceERC20 = await this.erc20.balanceOf(alice);
            assert.equal(7500, balanceERC20);

            const balanceLP = await this.lp.balanceOf(alice);
            assert.equal(5000, balanceLP);
        });

        it('has no deposit for alice', async () => {
            const deposited = await this.farm.deposited(0, alice);
            assert.equal(0, deposited);
        });

        it('has a total reward of 6500 MOCK pending', async () => {
            const totalPending = await this.farm.totalPending();
            assert.equal(6500, totalPending);
        });

        it('reserved nothing for alice, 2500 for bob, and 4000 for carl', async () => {
            const pendingAlice = await this.farm.pending(0, alice);
            assert.equal(0, pendingAlice);

            const pendingBob = await this.farm.pending(0, bob);
            assert.equal(2500, pendingBob);

            const pendingCarl = await this.farm.pending(0, carl);
            assert.equal(4000, pendingCarl);
        });
    });

    describe('with a participant partially withdrawing after 80 blocks', () => {
        before(async () => {
            await waitUntilBlock(10, this.startBlock + 79);
            await this.farm.withdraw(0, 1500, {from: carl});
        });

        it('gives carl 5600 MOCK and 1500 LP', async () => {
            const balanceERC20 = await this.erc20.balanceOf(carl);
            assert.equal(5600, balanceERC20);

            const balanceLP = await this.lp.balanceOf(carl);
            assert.equal(1500, balanceLP);
        });

        it('has a 500 LP deposit for carl', async () => {
            const deposited = await this.farm.deposited(0, carl);
            assert.equal(500, deposited);
        });

        it('has a total reward of 2900 MOCK pending', async () => {
            const totalPending = await this.farm.totalPending();
            assert.equal(2900, totalPending);
        });

        it('reserved nothing for alice, 2900 for bob, and nothing for carl', async () => {
            const pendingAlice = await this.farm.pending(0, alice);
            assert.equal(0, pendingAlice);

            const pendingBob = await this.farm.pending(0, bob);
            assert.equal(2900, pendingBob);

            const pendingCarl = await this.farm.pending(0, carl);
            assert.equal(0, pendingCarl);
        });
    });

    // describe('is safe', () => {
    //     it('won\'t allow alice to withdraw', async () => {
    //         try {
    //             await this.farm.withdraw(0, 10, {from: alice});
    //         } catch (ex) {
    //             assert.equal(ex.receipt.status, '0x0');
    //             return;
    //         }
    //         assert.fail('withdraw successful');
    //     });

    //     it('won\'t allow carl to withdraw more than his deposit', async () => {
    //         const deposited = await this.farm.deposited(0, carl);
    //         assert.equal(500, deposited);

    //         try {
    //             await this.farm.withdraw(0, 600, {from: carl});
    //         } catch (ex) {
    //             assert.equal(ex.receipt.status, '0x0');
    //             return;
    //         }
    //         assert.fail('withdraw successful');
    //     });

    //     it('won\'t allow alice to add an lp token to the pool', async () => {
    //         const deposited = await this.farm.deposited(0, carl);
    //         assert.equal(500, deposited);

    //         try {
    //             await this.farm.withdraw(0, 600, {from: carl});
    //         } catch (ex) {
    //             assert.equal(ex.receipt.status, '0x0');
    //             return;
    //         }
    //         assert.fail('withdraw successful');
    //     });
    // });

    describe('when it receives more funds (8000 MOCK)', () => {
        before(async () => {
            await this.erc20.approve(this.farm.address, 8000);
            await this.farm.fund(8000);
        });

        it('runs for 180 blocks (80 more)', async () => {
            const endBlock = await this.farm.endBlock();
            assert.equal(180, endBlock - this.startBlock);
        });
    });

    describe('with an added lp token (for 25%) after 100 blocks', () => {
        before(async () => {
            await waitUntilBlock(10, this.startBlock + 99);
            await this.farm.add(5, this.lp2.address, true);
        });
        

        it('has a total reward of 6900 MOCK pending', async () => {
            const totalPending = await this.farm.totalPending();
            assert.equal(6900, totalPending);
        });

        it('is initialized for the LP token 2', async () => {
            const poolLength = await this.farm.poolLength();
            assert.equal(2, poolLength);

            const poolInfo = await this.farm.poolInfo(1);
            assert.equal(poolInfo[0], this.lp2.address);
            assert.equal(poolInfo[1].words[0], 5);

            const totalAllocPoint = await this.farm.totalAllocPoint();
            assert.equal(totalAllocPoint, 20);
        });


        it('reserved nothing for alice, 4900 for bob, and 2000 for carl', async () => {
            const pendingAlice = await this.farm.pending(0, alice);
            assert.equal(0, pendingAlice);

            const pendingCarl = await this.farm.pending(0, carl);
            assert.equal(2000, pendingCarl);

            const pendingBob = await this.farm.pending(0, bob);
            assert.equal(4900, pendingBob);

            
        });
    });


    describe('with 1st participant for lp2 after 110 blocks', () => {
        before(async () => {
            await waitUntilBlock(10, this.startBlock + 108);

            await this.lp2.approve(this.farm.address, 500, { from: carl });
            await this.farm.deposit(1, 500, {from: carl});
        });

        it('holds 1000 LP for the participants', async () => {
            const balanceFarm = await this.lp.balanceOf(this.farm.address);
            assert.equal(1000, balanceFarm);

            const depositAlice = await this.farm.deposited(0, alice);
            assert.equal(0, depositAlice);

            const depositBob = await this.farm.deposited(0, bob);
            assert.equal(500, depositBob);

            const depositCarl = await this.farm.deposited(0, carl);
            assert.equal(500, depositCarl);
        });

        it('holds 500 LP2 for the participants', async () => {
            const balanceFarm = await this.lp2.balanceOf(this.farm.address);
            assert.equal(500, balanceFarm);

            const depositAlice = await this.farm.deposited(1, alice);
            assert.equal(0, depositAlice);

            const depositBob = await this.farm.deposited(1, bob);
            assert.equal(0, depositBob);

            const depositCarl = await this.farm.deposited(1, carl);
            assert.equal(500, depositCarl);
        });

        it('has a total reward of 7900 MOCK pending', async () => {
            const totalPending = await this.farm.totalPending();
            assert.equal(7900, totalPending);
        });

        it('reserved 75% for LP (50/50 bob/carl)', async () => {
            const pendingAlice = await this.farm.pending(0, alice);
            assert.equal(0, pendingAlice);

            const pendingBob = await this.farm.pending(0, bob);
            assert.equal(5275, pendingBob);

            const pendingCarl = await this.farm.pending(0, carl);
            assert.equal(2375, pendingCarl);
        });

        it('reserved 25% for LP2 (not rewarded) -> 250 MOCK inaccessible', async () => {
            const pendingAlice = await this.farm.pending(1, alice);
            assert.equal(0, pendingAlice);

            const pendingBob = await this.farm.pending(1, bob);
            assert.equal(0, pendingBob);

            const pendingCarl = await this.farm.pending(1, carl);
            assert.equal(0, pendingCarl);
        });
    });

    describe('with 2nd participant for lp2 after 120 blocks', () => {
        before(async () => {
            await waitUntilBlock(10, this.startBlock + 118);

            await this.lp2.approve(this.farm.address, 1000, { from: alice });
            await this.farm.deposit(1, 1000, {from: alice});
        });

        it('holds 1500 LP2 for the participants', async () => {
            const balanceFarm = await this.lp2.balanceOf(this.farm.address);
            assert.equal(1500, balanceFarm);

            const depositAlice = await this.farm.deposited(1, alice);
            assert.equal(1000, depositAlice);

            const depositBob = await this.farm.deposited(1, bob);
            assert.equal(0, depositBob);

            const depositCarl = await this.farm.deposited(1, carl);
            assert.equal(500, depositCarl);
        });

        it('has a total reward of 8900 MOCK pending', async () => {
            const totalPending = await this.farm.totalPending();
            assert.equal(8900, totalPending);
        });

        it('reserved 75% for LP with 3200 for bob and 1750 for carl', async () => {
            const pendingAlice = await this.farm.pending(0, alice);
            assert.equal(0, pendingAlice);

            const pendingBob = await this.farm.pending(0, bob);
            assert.equal(5650, pendingBob);

            const pendingCarl = await this.farm.pending(0, carl);
            assert.equal(2750, pendingCarl);
        });

        it('reserved 25% for LP2 with 250 for carl', async () => {
            const pendingAlice = await this.farm.pending(1, alice);
            assert.equal(0, pendingAlice);

            const pendingBob = await this.farm.pending(1, bob);
            assert.equal(0, pendingBob);

            const pendingCarl = await this.farm.pending(1, carl);
            assert.equal(250, pendingCarl);
        });
    });


    describe('after 140 blocks of farming', () => {
        before(async () => {
            await waitUntilBlock(10, this.startBlock + 140);
        });

        it('has a total reward of 10900 MOCK pending', async () => {
            const totalPending = await this.farm.totalPending();
            assert.equal(10900, totalPending);
        });

        it('reserved 75% for LP with 3950 for bob and 2500 for carl', async () => {
            const pendingAlice = await this.farm.pending(0, alice);
            assert.equal(0, pendingAlice);

            const pendingBob = await this.farm.pending(0, bob);
            assert.equal(6400, pendingBob);

            const pendingCarl = await this.farm.pending(0, carl);
            assert.equal(3500, pendingCarl);
        });

        it('reserved 25% for LP2 with 333 for alice and 416 for carl', async () => {
            const pendingAlice = await this.farm.pending(1, alice);
            assert.equal(333, pendingAlice);

            const pendingBob = await this.farm.pending(1, bob);
            assert.equal(0, pendingBob);

            const pendingCarl = await this.farm.pending(1, carl);
            assert.equal(416, pendingCarl);
        });
    });
});
