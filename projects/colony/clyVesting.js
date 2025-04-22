const { getLogs } = require('../helper/cache/getLogs');
const ethers = require("ethers");

/**
 * Helper class to store GroupDataSet events.
 *
 * The class provides a method to calculate the amount of unlocked vested tokens.
 */
class GroupDataSet {
  groupId;
  groupName;
  maxDistributionAmount;
  distributionOffset;
  distributionLength;
  initialRelease;

  constructor (eventArgs) {
    this.groupId = eventArgs[0];
    this.groupName = eventArgs[1];
    this.maxDistributionAmount = eventArgs[2];
    this.distributionOffset = Number(eventArgs[3]);
    this.distributionLength = Number(eventArgs[4]);
    this.initialRelease = eventArgs[5];
  }

  // for dbg purposes
  toString () {
    const secondsInDay = 3600 * 24;

    return `Group ${this.groupId} (${this.groupName}): ` +
           `maxDistributionAmount=${ethers.formatEther(this.maxDistributionAmount)}, ` +
           `distributionOffset=${this.distributionOffset / secondsInDay} days, ` +
           `distributionLength=${this.distributionLength / secondsInDay} days, ` +
           `initialRelease=${ethers.formatEther(this.initialRelease) * 100}%`;
  }


  unlockedAmount (startTimestamp, currentTimestamp) {
    let unlockedAmount = 0n;

    if (startTimestamp < currentTimestamp) {
      const initialReleaseAmount = this.initialRelease * this.maxDistributionAmount / ethers.parseEther("1");
      unlockedAmount += initialReleaseAmount;
    }

    // return only the initial release if the offset is not reached
    if (currentTimestamp < startTimestamp + this.distributionOffset) {
      return unlockedAmount;
    }

    // return max available amount if the vesting ended
    const endTimestamp = startTimestamp + this.distributionOffset + this.distributionLength;
    if (currentTimestamp >= endTimestamp) {
      return this.maxDistributionAmount;
    }

    // calculate the amount of unlocked tokens
    const timePassed = BigInt(currentTimestamp - (startTimestamp + this.distributionOffset));
    unlockedAmount += timePassed * (this.maxDistributionAmount - unlockedAmount) / BigInt(this.distributionLength);

    return unlockedAmount;
  }
}

/**
 * Method to calculate the total amount of unlocked vested tokens:
 *
 * Collects GroupDataSet events (that were emitted only before the actual start of vesting).
 *
 * event GroupDataSet(
 *    uint groupId, // Unique identifier for the group
 *    string groupName, // Descriptive name of the group
 *    uint maxDistributionAmount, // Total number of tokens allocated for distribution to this group
 *    uint distributionOffset, // The offset in seconds from the start, when distribution begins
 *    uint distributionLength, // The total time span of the distribution, in seconds
 *    uint initialRelease, // The amount of tokens that are initially released as 18 dec mantissa
 * );
 *
 * Events for all groups reveals the total number of tokens distributed and the manner
 * in which they were unlocked over time.
 *
 * The total amount of tokens unlocked by vesting contract can be deduced by comparing this with the
 * actual balance of the contract (which contains information about the tokens already withdrawn).
 */
function clyVesting(colonyGovernanceToken, vestingContract) {
  return async ({ api }) => {

    const START_BLOCK = 7669442; // 7669442 -> deployment block of the vesting contract
    const END_BLOCK = 7675925; // The last block where the GroupDataSet event was emitted

    const vestingStartTimestamp = Number(
      await api.call({
        abi: "function vestingStartTimestamp() external view returns (uint256)",
        target: vestingContract,
      })
    );

    const currentVestingBalance = BigInt(
      await api.call({
        abi: 'erc20:balanceOf',
        target: colonyGovernanceToken,
        params: vestingContract
      })
    );

    const eventArgs = (
      await getLogs({
        target: vestingContract,
        eventAbi: "event GroupDataSet(uint256,string,uint256,uint256,uint256,uint256)",
        api,
        fromBlock: START_BLOCK,
        toBlock: END_BLOCK,
        onlyArgs: true,
      })
    );

    const groups = eventArgs.map((args) => new GroupDataSet(args));

    // calculate total vested amount, summing maxDistributionAmount of all groups
    let totalVestedAmount = 0n;
    for (const group of groups) {
      totalVestedAmount += group.maxDistributionAmount;
    }

    // calculate total unlocked amount
    let totalUnlockedAmount = 0n
    for (const group of groups) {
      totalUnlockedAmount += group.unlockedAmount(vestingStartTimestamp, api.timestamp);
    }

    // calculate total withdrawn amount
    const totalWithdrawn = totalVestedAmount - currentVestingBalance;

    // total amount of tokens unlocked by vesting contract, but not yet withdrawn
    const availableToWithdraw = totalUnlockedAmount - totalWithdrawn;

    api.add(colonyGovernanceToken, availableToWithdraw);
  }
}

module.exports = {
  clyVesting,
}
