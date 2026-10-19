const { getLogs2 } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

// Cork Phoenix (v2) — rebuilt after the May 2025 exploit
// Docs: https://docs.cork.tech
// Contracts: https://github.com/Cork-Technology/phoenix/blob/main/config/prod.toml

const POOL_MANAGER = '0xccCCcCcCCccCfAE2Ee43F0E727A8c2969d74B9eC'
const FROM_BLOCK = 24238837 // history_last_deployment_block (mainnet)

// MarketId is bytes32 — emitted on every new pool creation
const marketCreatedAbi = 'event MarketCreated(bytes32 indexed poolId, address indexed referenceAsset, address indexed collateralAsset, uint256 expiry, address rateOracle, address principalToken, address swapToken)'

async function tvl(api) {
  // Discover all pools via MarketCreated events
  const logs = await getLogs2({
    api,
    target: POOL_MANAGER,
    eventAbi: marketCreatedAbi,
    fromBlock: FROM_BLOCK,
  })

  const tokenSet = new Set();

  logs.forEach(log => {
    tokenSet.add(log.referenceAsset)
    tokenSet.add(log.collateralAsset)
  });

  await sumTokens2({api, tokens: Array.from(tokenSet), owner: POOL_MANAGER});
}

module.exports = {
  doublecounted: true,
  methodology: 'Sum of collateral assets (deposited by LPs) and reference assets (accumulated via cST exercise) locked across all Cork Phoenix pools on the CorkPoolManager contract.',
  ethereum: { tvl },
}
