const { sumTokens2 } = require("../helper/unwrapLPs");

const lockerAddresses = {
  polygon: "0xBEdDcf2c709B3cEd29560E32322E09AEaC79316E",
  bsc: "0x0504C1048E3E8f49B435638496202337881c7F89",
  arbitrum: "0xBEdDcf2c709B3cEd29560E32322E09AEaC79316E",
};

const lockCountAbi = "uint256:lockCount";
const locksAbi = "function locks(uint256) view returns (address token, address owner, uint256 amount, uint256 claimed, uint256 lockDate, uint256 unlockDate, uint256 vestingStart, uint256 vestingDuration, bool isLP)";

async function tvl(api, vesting = false) {
  const target = lockerAddresses[api.chain];
  const locks = await api.fetchList({ lengthAbi: lockCountAbi, itemAbi: locksAbi, target})

  for (const lock of locks) {
    if((!vesting && lock.vestingStart != 0) || (vesting && lock.vestingStart == 0)) continue
    const remaining = BigInt(lock.amount) - BigInt(lock.claimed);
    if (remaining > 0n) {
      api.add(lock.token, remaining.toString());
    }
  }

  return sumTokens2({ api, resolveLP: true })
} 

module.exports = {
  methodology: "Counts the remaining locked token balances (amount - claimed) across all active locks in the TokenLocker contract on each chain.",
  start: 1717200000,
};

Object.keys(lockerAddresses).forEach((chain) => {
  module.exports[chain] = { tvl: api => tvl(api), vesting: api => tvl(api, true) };
});
