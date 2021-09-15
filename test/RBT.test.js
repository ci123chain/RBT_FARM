const RBT = artifacts.require('./token/RBT.sol')
contract('RBT', ([owner, user1, user2, user3, user4, user5, team1, team2, team3, user6]) => {
    describe('', () => {
        before(async () => {
            const initbal = getWei("400000000", 18)
            this.initbalance = initbal
            const rbt = await RBT.new("RBT", "RBTSys", 18, initbal, 6, 10, 5, 5);
            // 设置5s
            await rbt.setInterval(5);
            this.rbt = rbt
        });

        it("init priv investment", async () => {
            addresses = [
                user1, 
                user2, 
                user3, 
                user4, 
                user5
            ];
            balances = [
                10,
                15,
                20,
                20,
                35
            ]
            await this.rbt.addPrivInvs(addresses, balances)
        });

        it("init team investment", async () => {
            addresses = [
                team1, 
                team2, 
                team3
            ];
            balances = [
                20,
                30,
                50,
            ]
            await this.rbt.addTeamInvs(addresses, balances)
        });

        it("get priv investment", async () => {
            user1bal = await this.rbt.balanceOf(user1)
            assert.equal(user1bal.toString(), getWei("240000", 18).toString())

            user2bal = await this.rbt.balanceOf(user2)
            assert.equal(user2bal.toString(), getWei("360000", 18).toString())

            user4bal = await this.rbt.balanceOf(user4)
            assert.equal(user4bal.toString(), getWei("480000", 18).toString())
        });

        it("get team investment", async () => {
            team1bal = await this.rbt.balanceOf(team1)
            assert.equal(team1bal.toString(), getWei("200000", 18).toString())

            team2bal = await this.rbt.balanceOf(team2)
            assert.equal(team2bal.toString(), getWei("300000", 18).toString())

            team3bal = await this.rbt.balanceOf(team3)
            assert.equal(team3bal.toString(), getWei("500000", 18).toString())
        });

        it("add priv investment exceed", async () => {
            try {
                await this.rbt.addPrivInv(user6, 1)
            } catch(e) {
                return
            }
            assert.fail('add priv investment should failed');
        });
        it("add team investment exceed", async () => {
            try {
                await this.rbt.addTeamInv(user6, 1)
            } catch(e) {
                return
            }
            assert.fail('add team investment should failed');
        });

        it("sleep 6s", async () => {
            sleep (6);
            await this.rbt.withdrawInPriv(user1);
            await this.rbt.withdrawInTeam(team1);

            user1bal = await this.rbt.balanceOf(user1)
            assert.equal(user1bal.toString(), getWei("480000", 18).toString())

            team1bal = await this.rbt.balanceOf(team1)
            assert.equal(team1bal.toString(), getWei("400000", 18).toString())

        });

        it("sleep 11s", async () => {
            sleep (5);
            await this.rbt.withdrawInPriv(user1);
            await this.rbt.withdrawInTeam(team1);

            user1bal = await this.rbt.balanceOf(user1)
            assert.equal(user1bal.toString(), getWei("720000", 18).toString())

            team1bal = await this.rbt.balanceOf(team1)
            assert.equal(team1bal.toString(), getWei("600000", 18).toString())

        });
    });
});

function getWei(amount, decimals) {
    return web3.utils.toBN(10).pow(web3.utils.toBN(decimals)).mul(web3.utils.toBN(amount))
}


function sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time * 1000));
}