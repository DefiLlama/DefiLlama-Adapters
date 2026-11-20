const { sliceIntoChunks, mergeExports } = require('../helper/utils');
const { getLowValueCache } = require('../helper/cache/lowValue');
const { aaveV4Export } = require("../helper/aave");

const CONFIG = {
  scroll: {
    etherFiCashFactory: '0xF4e147Db314947fC1275a8CbB6Cde48c510cd8CF',
    cashBorrowerHelperContract: '0xF0df37503714f08d0fCA5B434F1FFA2b8b1AF34B',
    cashDebitCore: '0x0078C5a459132e279056B2371fE8A8eC973A9553',
  },
  optimism: {
    etherFiCashFactory: '0xF4e147Db314947fC1275a8CbB6Cde48c510cd8CF',
    cashBorrowerHelperContract: '0x0Da474E396F059594C0412ED79b2C9349bbc8087',
    cashDebitCore: '0x0078C5a459132e279056B2371fE8A8eC973A9553',
    // one eth_call covers 400 safes: the helper handles 600 per call here and reverts (gas) at 1200
    multicallSize: 8,
  },
}

const abi = {
  numContractsDeployed: 'function numContractsDeployed() view returns (uint256)',
  getTotalCollateralForSafesWithIndex: 'function getTotalCollateralForSafesWithIndex(uint256 startIndex, uint256 n) view returns (tuple(address token, uint256 amount)[])',
  totalBorrowingAmount: 'function totalBorrowingAmount(address borrowToken) view returns (uint256)',
  getBorrowTokens: 'function getBorrowTokens() view returns (address[])',
}

const SAFES_PER_CALL = 50
const MULTICALL_SIZE = 3
// ranges are read in groups, one multiCall per group, so the low-value ranges found so far can be saved between groups
const RANGES_PER_GROUP = 600
const LOW_VALUE_RANGE_USD = 500
const MAX_FAILED_RANGES = 20

// The helper only reports collateral for a run of consecutive safes, so a "range" of SAFES_PER_CALL safes is the unit here.
// Most ranges hold next to nothing (all of Scroll since the move to OP Mainnet): a range worth under LOW_VALUE_RANGE_USD is
// stored with its collateral, counted from the store, and read again once a week.
const tvl = async (api) => {
  const { etherFiCashFactory, cashBorrowerHelperContract, multicallSize = MULTICALL_SIZE } = CONFIG[api.chain]
  const numSafes = (await api.call({ abi: abi.numContractsDeployed, target: etherFiCashFactory })) - 1
  const starts = []
  for (let i = 0; i < numSafes; i += SAFES_PER_CALL) starts.push(i)
  if (!starts.length) return api.getBalances()

  const lowValue = await getLowValueCache({ api, project: 'etherfi-cash', key: `${api.chain}-ranges-of-${SAFES_PER_CALL}`, thresholdUSD: LOW_VALUE_RANGE_USD, checkpointEvery: RANGES_PER_GROUP })
  // the last range is still filling up with new safes: it is read every run and never stored
  const lastStart = starts.pop()
  const toRead = [...lowValue.filter(starts.map(String)).map(Number), lastStart]
  let failures = 0

  const readRanges = (rangeStarts, chunkSize) => api.multiCall({
    abi: abi.getTotalCollateralForSafesWithIndex, target: cashBorrowerHelperContract, chunkSize, permitFailure: true,
    calls: rangeStarts.map(start => ({ params: [start, Math.min(SAFES_PER_CALL, numSafes - start)] })),
  })

  for (const group of sliceIntoChunks(toRead, RANGES_PER_GROUP)) {
    const res = await readRanges(group, multicallSize)
    // The helper call is heavy and RPCs drop whole batches of it under load, while the same range reads fine on its own:
    // ranges that came back empty are read again, one range per eth_call, before any of them counts as failed.
    for (let attempt = 0; attempt < 3; attempt++) {
      const missing = group.map((_, i) => i).filter(i => !res[i])
      if (!missing.length) break
      const retried = await readRanges(missing.map(i => group[i]), 1)
      missing.forEach((i, j) => res[i] = retried[j])
    }
    const results = []
    res.forEach((rangeCollateral, i) => {
      if (!rangeCollateral) {
        // a failed range is left out of this run only; too many of them and the total is not worth reporting
        if (++failures >= MAX_FAILED_RANGES) throw new Error(`Too many sub-call failures (${failures}), aborting to avoid serving incomplete data`)
        return
      }
      const held = {}
      rangeCollateral.forEach(({ token, amount }) => held[token] = (BigInt(held[token] ?? 0) + BigInt(amount)).toString())
      if (group[i] === lastStart) Object.entries(held).forEach(([token, amount]) => api.add(token, amount))
      else results.push([String(group[i]), held])
    })
    await lowValue.record(results)
  }

  await lowValue.save()
  return api.getBalances()
}

async function borrowed(api) {
  if (api.chain === 'scroll') return;
  const borrowTokens = await api.call({ target: CONFIG[api.chain].cashDebitCore, abi: abi.getBorrowTokens })
  const borrowAmounts = await api.multiCall({ target: CONFIG[api.chain].cashDebitCore, abi: abi.totalBorrowingAmount, calls: borrowTokens })
  for (let i = 0; i < borrowTokens.length; i++) {
    api.add(borrowTokens[i], borrowAmounts[i])
  }

  return api.getBalances()
}

const v1Exports = {
  isHeavyProtocol: true,
  scroll: { tvl, borrowed },
  optimism: { tvl, borrowed },

}


const v2Exports = aaveV4Export({
  optimism: [
    "0x66753c4e3fC84f1eD0e3C267C927284E9d90C572", // Core Hub
  ],
});

module.exports = mergeExports(v1Exports, v2Exports)
module.exports.hallmarks = [
  ['2026-04-08', 'Operation is migrated to OP Mainnet']
]
delete module.exports.methodology