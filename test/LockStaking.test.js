const LockStaking = artifacts.require('./LockedStaking.sol');
const LPFarm = artifacts.require('./LPFarm.sol');
const ERC20 = artifacts.require('./mock/ERC20Mock.sol');
const LP = artifacts.require('./mock/LPMock.sol');
const { waitUntilBlock } = require('./helpers/tempo')(web3);

contract('Deploy Unlocking Farm', ([owner, alice, bob, carl]) => {
    before(async () => {
        this.erc20 = await ERC20.new("Mock token", "MOCK", 0, 1000000);
        let balance = await this.erc20.balanceOf(owner);
        assert.equal(balance.valueOf(), 1000000);

        await this.erc20.transfer(alice, 2000, {from: owner});

        this.lp = await LP.new("LP Token", "LP", 0);
        this.lp2 = await LP.new("LP Token 2", "LP2", 0);

        const currentBlock = await web3.eth.getBlockNumber();
        this.startBlock = currentBlock + 100;

        this.farm = await LPFarm.new(this.erc20.address, 1, 100, this.startBlock); // 10coin perblock, 100 rainbow blocks
        await this.farm.add(15, this.lp.address, false);
        await this.farm.add(5, this.lp2.address, true);

        await this.erc20.approve(this.farm.address, 20000);
        await this.farm.fund(20000);
 
    });

    before(async () => {
        await Promise.all([
            this.lp.mint(alice, 5000000),
            this.lp.mint(bob, 3000000),
            this.lp.mint(carl, 2000000),
        ]);

        await Promise.all([
            this.lp.approve(this.farm.address, 2000000, { from: alice }),
            this.lp.approve(this.farm.address, 1000000, { from: bob }),
            this.lp.approve(this.farm.address, 1000000, { from: carl })
        ]);

        await Promise.all([
            this.farm.deposit(0, 2000000, {from: alice}),
            this.farm.deposit(0, 1000000, {from: bob}),
            this.farm.deposit(0, 1000000, {from: carl})
        ]);
    });

    describe('after 10 blocks of farming', () => {
        before(async () => {
            await waitUntilBlock(10, this.startBlock + 10);
        });

        it('has a total reward of 200 MOCK pending', async () => {
            const totalPending = await this.farm.totalPending();
            assert.equal(20, totalPending);
        });

        it('reserved 11 for alice and 3 for bob', async () => {
            const pendingAlice = await this.farm.pending(0, alice);
            assert.equal(7, pendingAlice);
            const pendingBob = await this.farm.pending(0, bob);
            assert.equal(3, pendingBob);
        });

        it('get apy of pool 0', async () => {
            const apy0 = await this.farm.APYPercent(0);
            assert.equal(145, apy0);
        });
    });

    describe('Deploy LockStaking', () => {
        before(async () => {
            this.lockstake = await LockStaking.new(this.erc20.address, this.farm.address);
            await this.erc20.approve(this.lockstake.address, 100000);
            await this.lockstake.fund(100000)

            await this.lockstake.add(7, 115);
            await this.lockstake.add(15, 130);
            await this.lockstake.add(30, 150);
        });
        it('stake 2000 to pool 0', async () => {
            await this.erc20.approve(this.lockstake.address, 2000, {from: alice});
            await this.lockstake.stake(0, 2000, {from: alice}); 

            const stake = await this.lockstake.getStake(1);
            const stakeendtime = await this.lockstake.endTimeOfStakeID(1);
            assert.equal(7 * 60 * 60 * 24, stakeendtime - stake['0']);
            assert.equal(2000, stake["1"]);
            assert.equal(55, stake["2"]);

            const totalStake = await this.lockstake.totalStaked()
            assert.equal(2000, totalStake);
        });
        it('withdraw with stakeid 1', async () => {
            try {
                await this.lockstake.withdraw(1); 
            } catch (ex) {
                return;
            }
            assert.fail('withdraw successful');
        });

        
    });

    // describe('In dev_mode', () => {
    //     it('withdraw', async () => {
    //         await this.lockstake.withdraw_dev(1, {from: alice}); 
    //     });

    //     it('alice should have 55 reward', async () => {
    //         aliceBal = await this.erc20.balanceOf(alice); 
    //         assert.equal(2055, aliceBal)

    //         const totalStake = await this.lockstake.totalStaked()
    //         assert.equal(0, totalStake);
    //     });
    // });

});

function sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time * 1000));
}