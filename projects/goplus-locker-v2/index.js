const { vestingHelper } = require("../helper/unknownTokens")

const abi = {
  nextLockId: "function nextLockId() view returns (uint256)",
  locks: "function locks(uint256) view returns (uint256 lockId, address token, bool isLpToken, address pendingOwner, address owner, uint24 tgeBps, uint24 cycleBps, uint256 amount, uint256 startTime, uint256 endTime, uint256 cycle, uint256 unlockedAmount, bytes32 feeNameHash)"
}

const CONFIG = {
  base: {
    contracts: [
      {
        address: "0xF17A08A7d41F53B24AD07Eb322CBBdA2ebdeC04b",
      }
    ],
  },
  ethereum: {
    contracts: [
      {
        address: "0xF17A08A7d41F53B24AD07Eb322CBBdA2ebdeC04b",
      }
    ],
  },
  bsc: {
    contracts: [
      {
        address: "0xF17A08A7d41F53B24AD07Eb322CBBdA2ebdeC04b"
      },
      {
        address: "0x7AA03D4b9051cF299e7A2272953D0590FEE485A4"
      }
    ],
  },
  arbitrum: {
    contracts: [
      {
        address: "0xF17A08A7d41F53B24AD07Eb322CBBdA2ebdeC04b"
      }
    ],
  },
}

async function tvl(api) {
  const chain = api.chain
  const contracts = CONFIG[chain].contracts

  for (const { address: contract } of contracts) {
    const lockInfos = await api.fetchList({ lengthAbi: abi.nextLockId, itemAbi: abi.locks, target: contract })
    const tokens = lockInfos.filter(i => i.isLpToken).map(i => i.token)
    const balance = await vestingHelper({
      cache: {},
      useDefaultCoreAssets: true,
      owner: contract,
      tokens: [...new Set(tokens)],
      block: api.block, chain: api.chain,
    })
    api.addBalances(balance)
  }
}

module.exports = {
  methodology: "Calculates the total value LP tokens locked in the protocol's vesting contracts",
  base: { tvl },
  ethereum: { tvl },
  bsc: { tvl },
  arbitrum: { tvl },
}

