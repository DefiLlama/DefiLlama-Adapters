const { unwrapLPsAuto } = require("../helper/unwrapLPs");

const lockerAddresses = {
  polygon: "0xBEdDcf2c709B3cEd29560E32322E09AEaC79316E",
  bsc: "0x0504C1048E3E8f49B435638496202337881c7F89",
  arbitrum: "0xBEdDcf2c709B3cEd29560E32322E09AEaC79316E",
};

const AVZ = "0x26A352A55F9F278Cf939cc57AB10cfe7c6e636b8";
const LOCK_ABI = "function locks(uint256) view returns (address token, address owner, uint256 amount, uint256 claimed, uint256 lockDate, uint256 unlockDate, uint256 vestingStart, uint256 vestingDuration, bool isLP)";

const isVesting = (lock) => lock.vestingStart != 0;
const isAVZ = (lock) => lock.token.toLowerCase() === AVZ.toLowerCase();

async function addLocks(api, filter) {
  const locks = await api.fetchList({ target: lockerAddresses[api.chain], lengthAbi: "uint256:lockCount", itemAbi: LOCK_ABI });
  for (const lock of locks) {
    if (!filter(lock)) continue;
    const remaining = BigInt(lock.amount) - BigInt(lock.claimed);
    if (remaining > 0n) api.add(lock.token, remaining.toString());
  }
}

async function tvl(api) {
  await addLocks(api, (l) => !isVesting(l) && !isAVZ(l));
  await unwrapLPsAuto({ api });
}

async function staking(api) {
  await addLocks(api, (l) => !isVesting(l) && isAVZ(l));
}

async function vesting(api) {
  await addLocks(api, (l) => isVesting(l));
  await unwrapLPsAuto({ api });
}

const chains = ["polygon", "bsc", "arbitrum"];
module.exports = {
  methodology: "TVL is the remaining locked balance (amount - claimed) of every non-AVZ, non-vesting lock in the TokenLocker on each chain. Staking is locked AVZ (the protocol token). Vesting is the remaining balance of locks with a vesting schedule.",
  start: '2026-06-20',
};

chains.forEach((chain) => {
  module.exports[chain] = { tvl, staking, vesting };
});
