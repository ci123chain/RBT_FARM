// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;
pragma experimental ABIEncoderV2;
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


interface IUnlockStaking {
    function APYPercent(uint256 pool_id) external view returns(uint256);
}

contract LockedStaking is Ownable {
    using SafeMath for uint256;
    using SafeMath for uint;
    IERC20 public RBT;
    IUnlockStaking unlockStake;

    uint256 public totalStaked = 0;
    uint256 public totalRewards = 0;
    bool isClosed = false;
    
    uint256 private _currentStakeID = 0;
    // uint256[] public APYs = [115, 130, 150];
    // uint256[] public StakingDays = [7, 15, 30];

    // Info of lp pool.
    struct PoolInfo {
        uint256 lockDays;       
        uint256 apyRate;        
    }
    // Info of each pool.
    PoolInfo[] public poolInfos;


    struct StakeInfo {
        uint256 stakeID;
        uint256 poolID;
        uint256 amount;
        uint256 reward;
        uint256 startTime;
        address staker;
    }
    mapping (uint256=> StakeInfo) stakes;
    mapping (address => uint256[]) userStakes;

    constructor(address _RBT, address _unlockStaking) public {
        require(_RBT != address(0), "RBT address cannot be empty");
        require(_unlockStaking != address(0), "UnlockingState address cannot be empty");
        RBT = IERC20(_RBT);
        unlockStake = IUnlockStaking(_unlockStaking);
    }

    // Fund the farm, increase the end block
    function fund(uint256 _amount) public {
        require(!isClosed, "staking is closed");
        RBT.transferFrom(msg.sender, address(this), _amount);
    }

    // change apy rate of poolid
    function setRate(uint256 _rate, uint256 _id) public onlyOwner {
        require(!isClosed, "staking is closed");
        require(_id >= 0, "less than minimum staking type");
        require(_id < poolInfos.length, "more than maximum staking type");
        PoolInfo storage pinfo = poolInfos[_id];
        pinfo.apyRate = _rate;
    }

    // Add a new lp to the pool. Can only be called by the owner.
    function add(uint256 _lockDays, uint256 _apyRate) public onlyOwner {
        require(!isClosed, "staking is closed");
        poolInfos.push(PoolInfo({
            lockDays: _lockDays,
            apyRate: _apyRate
        }));
    }

    event Debug( uint256 _balancethis, uint256 _reward);

    // stake coins to poolid
    function stake(uint256 _id, uint256 _amount) public {
        require(!isClosed, "staking is closed");
        require(_id >= 0, "less than minimum staking type");
        require(_id < poolInfos.length, "more than maximum staking type");
        require(_amount > 1, "amount to small");

        // calculate reward
        uint256 _reward = calculateReward(_amount, _id);

        // contract must have funds to keep this commitment
        require(RBT.balanceOf(address(this)) > totalOwedValue().add(_reward).add(_amount), "insufficient contract bal");

        require(RBT.transferFrom(msg.sender, address(this), _amount), "transfer failed");

        uint256 nextstakeID = getNextStakeID();
        stakes[nextstakeID].stakeID = nextstakeID;
        stakes[nextstakeID].poolID = _id;
        stakes[nextstakeID].amount = _amount;
        stakes[nextstakeID].reward = _reward;
        stakes[nextstakeID].startTime = now;
        stakes[nextstakeID].staker = msg.sender;

        userStakes[msg.sender].push(nextstakeID);
        // update stats
        totalStaked = totalStaked.add(_amount);
        totalRewards = totalRewards.add(_reward);
    }


    function withdraw(uint256 _stake_id) public {
        require(!isClosed, "staking is closed");
        require(block.timestamp > endTimeOfStakeID(_stake_id), "too early");
        StakeInfo storage sinfo = stakes[_stake_id];
        require(sinfo.staker == msg.sender, "not your stake");
        uint256 owed = sinfo.amount.add(sinfo.reward);

        // update stats
        totalStaked = totalStaked.sub(sinfo.amount);
        totalRewards = totalRewards.sub(sinfo.reward);

        require(RBT.transfer(sinfo.staker, owed), "transfer failed");
    }


    // close or open the farm
    function close(bool closed) public onlyOwner {
        isClosed = closed;
    }

    // computer the unlocktime of the stake
    function endTimeOfStakeID(uint256 _stake_id) public view returns (uint256) {
        StakeInfo memory sinfo = stakes[_stake_id];
        require(sinfo.startTime > 0, "stake id not exist");
        uint256 poolid = sinfo.poolID;
        PoolInfo memory pinfo = poolInfos[poolid];
        return pinfo.lockDays.mul(1 days).add(sinfo.startTime);
    }

    function getStake(uint256 _stake_id) public view returns (StakeInfo memory) {
        StakeInfo memory sinfo = stakes[_stake_id];
        require(sinfo.startTime > 0, "stake id not exist");
        return sinfo;
    }


    function getStakes() public view returns (StakeInfo[] memory) {
        uint256[] storage stakeids = userStakes[msg.sender];
        StakeInfo[] memory sinfos = new StakeInfo[](stakeids.length);

        for (uint256 i = 0; i < stakeids.length; i++) {
            StakeInfo memory si = stakes[stakeids[i]];
            sinfos[i] = si;
        }
        return sinfos;
    }

    // calculate reward of poolid with amount
    function calculateReward(uint256 _amount, uint256 _id) public view returns (uint256) {
        require(_id >= 0, "less than minimum staking type");
        require(_id < poolInfos.length, "more than maximum staking type");
        uint256 apy = apyOfUnLockStaking(_id);
        PoolInfo memory pinfo = poolInfos[_id];
        uint256 lockReward = _amount.mul(apy).mul(pinfo.lockDays).div(365).div(100);
        return lockReward;
    }

    // calculates the next stake ID based on value of _currentStakeID
    function getNextStakeID() internal virtual returns (uint256) {
        uint256 nextStakeID =  _currentStakeID + 1;
        return nextStakeID;
    }

    // increments the value of _currentStakeID
    function incrementStakeId() private  {
        _currentStakeID++;
    }

    // helpers:
    function totalOwedValue() public view returns (uint256) {
        return totalStaked.add(totalRewards);
    }

    function apyOfUnLockStaking(uint256 _id) internal view returns (uint256) {
        uint256 actureApy = unlockStake.APYPercent(_id);
        return actureApy;
    }

    // Compute apy of pool
    function APYPercent(uint256 _id) public view returns (uint256) {
        require(_id >= 0, "less than minimum staking type");
        require(_id < poolInfos.length, "more than maximum staking type");
        PoolInfo memory pinfo = poolInfos[_id];
        uint256 apyUnlock = apyOfUnLockStaking(_id);
        uint256 apy = pinfo.apyRate.mul(apyUnlock).div(100);
        return apy;
    }
}