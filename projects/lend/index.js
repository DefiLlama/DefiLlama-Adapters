const LEND_FACTORY_ADDRESS = '0xbfbAff7afE2beA4fD130C4965B6eb28bd1DA4061'
const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
/**
 * Calculates the TVL for Lend.xyz on Ethereum.
 *
 * TVL is the sum of `fundingProgress` (total USDC raised) across all
 * non-cancelled real estate operations managed by the Lend Factory contract.
 * Operations where `operationCanceled === true` are excluded because those
 * funds have been returned to investors.
 *
 * @param {object} api - DefiLlama SDK ChainApi instance for Ethereum.
 * @returns {Promise<void>} Resolves once the USDC balance has been added to the api.
 */
async function tvl(api) {
  const operationCount = await api.call({
    abi: 'function operationCount() external view returns (uint256)',
    target: LEND_FACTORY_ADDRESS,
  })
  const ids = Array.from({ length: Number(operationCount) }, (_, i) => i + 1)
  const [canceled, fundingProgresses] = await Promise.all([
    api.multiCall({
      abi: 'function operationCanceled(uint256 id) external view returns (bool)',
      calls: ids.map(id => ({ target: LEND_FACTORY_ADDRESS, params: [id] })),
    }),
    api.multiCall({
      abi: 'function fundingProgress(uint256 id) external view returns (uint256)',
      calls: ids.map(id => ({ target: LEND_FACTORY_ADDRESS, params: [id] })),
    }),
  ])
  let total = BigInt(0)
  for (let i = 0; i < ids.length; i++) {
    if (!canceled[i]) {
      total += BigInt(fundingProgresses[i])
    }
  }
  api.add(USDC_ADDRESS, total.toString())
}
module.exports = {
  methodology: 'Counts the total USDC raised through active (non-cancelled) Lend real estate operations. Each operation represents a tokenized real estate project funded by investors.',
  ethereum: { tvl },
}
