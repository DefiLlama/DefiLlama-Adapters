const ADDRESSES = require('../helper/coreAssets.json');
const { sliceIntoChunks, sleep } = require('../helper/utils');
const { PromisePool } = require('@supercharge/promise-pool');

const CONFIG = {
  etherFiCashFactory: '0xF4e147Db314947fC1275a8CbB6Cde48c510cd8CF',
  cashBorrowerHelperContract: '0xF0df37503714f08d0fCA5B434F1FFA2b8b1AF34B',
  cashDebitCore: '0x0078C5a459132e279056B2371fE8A8eC973A9553',
}

const abi = {
  numContractsDeployed: 'function numContractsDeployed() view returns (uint256)',
  getTotalCollateralForSafesWithIndex: 'function getTotalCollateralForSafesWithIndex(uint256 startIndex, uint256 n) view returns (tuple(address token, uint256 amount)[])',
  totalBorrowingAmount: 'function totalBorrowingAmount(address borrowToken) view returns (uint256)',
}

const SAFES_PER_CALL = 50
const MULTICALL_SIZE = 3
const CONCURRENCY = 80

const tvl = async (api) => {
  const { etherFiCashFactory, cashBorrowerHelperContract } = CONFIG
  const numSafes = (await api.call({ abi: abi.numContractsDeployed, target: etherFiCashFactory })) - 1

  const calls = []
  for (let i = 0; i < numSafes; i += SAFES_PER_CALL) {
    calls.push({ target: cashBorrowerHelperContract, params: [i, Math.min(SAFES_PER_CALL, numSafes - i)] })
  }

  const chunks = sliceIntoChunks(calls, MULTICALL_SIZE)
  let processed = 0
  let failures = 0

  await PromisePool.withConcurrency(CONCURRENCY)
    .for(chunks)
    .process(async (chunk) => {
      let res
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          res = await api.multiCall({ abi: abi.getTotalCollateralForSafesWithIndex, calls: chunk, permitFailure: true })
          break
        } catch (e) {
          if (attempt === 2) throw e
          await sleep(1000 * (attempt + 1))
        }
      }
      res.forEach(batchResult => {
        if (!batchResult) { failures++; return }
        batchResult.forEach(({ token, amount }) => api.add(token, amount))
      })
      processed += chunk.length * SAFES_PER_CALL
      // api.log(`Processed ${Math.min(processed, numSafes)}/${numSafes} safes (${failures} sub-call failures, ~${failures * SAFES_PER_CALL} safes skipped)`)
    })
}

async function borrowed(api) {
  const usdcScroll = ADDRESSES.scroll.USDC
  const borrowingAmount = await api.call({ target: CONFIG.cashDebitCore, abi: abi.totalBorrowingAmount, params: [usdcScroll] })
  api.add(usdcScroll, borrowingAmount)
}

module.exports = {
  isHeavyProtocol: true,
  scroll: { tvl, borrowed },
}