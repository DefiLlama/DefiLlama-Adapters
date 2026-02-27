const { uniV3GraphExport } = require('../projects/helper/uniswapV3')
const { buildProtocolExports } = require('./utils')

function uniV3GraphExportFn(chainConfigs) {
  const result = {}
  Object.entries(chainConfigs).forEach(([chain, config]) => {
    if (!config) {
      // null/false config means empty tvl (e.g. dead chain)
      result[chain] = { tvl: () => ({}) }
    } else {
      result[chain] = {
        tvl: uniV3GraphExport(config),
      }
    }
  })
  return result
}

const configs = {
  'snap-v3': {
    tac: { graphURL: 'https://api.goldsky.com/api/public/project_cltyhthusbmxp01s95k9l8a1u/subgraphs/cl-analytics-tac/v1.0.1/gn', name: 'snap-tac' },
  },
  'upheaval-v3': {
    hyperliquid: { graphURL: 'https://api.upheaval.fi/subgraphs/name/upheaval/exchange-v3-fixed', name: 'upheaval' },
  },
  'rooster-protocol': {
    plume_mainnet: { graphURL: 'https://api.goldsky.com/api/public/project_cmeix03obfpwk012m74ysbe8w/subgraphs/analytics/1.0.8/gn', name: 'roosterplume_mainnet', blacklistedTokens: [] },
  },
  'okieswap-stableswap': {
    xlayer: { graphURL: 'https://subgraph.okiedokie.fun/subgraphs/name/stableswap', name: 'okie-stable-xlayer', poolName: 'pairs' },
  },
  'okieswap-v3': {
    xlayer: { graphURL: 'https://subgraph.okiedokie.fun/subgraphs/name/okieswap-v3', name: 'okieswap-v3-xlayer' },
  },
  'kittenswap-algebra': {
    hyperliquid: { graphURL: 'https://api.goldsky.com/api/public/project_cmcxkn8h7pwwc01x30a5e6t39/subgraphs/cl-analytics-prod/v1.0.0/gn', name: 'kittenswap-algebrahyperliquid', blacklistedTokens: ['0x1d25eeeee9b61fe86cff35b0855a0c5ac20a5feb'] },
  },
  'hydradex-v3': {
    misrepresentedTokens: true,
    methodology: 'We count liquidity on the dex, pulling data from subgraph',
    hydra: null,
    hydragon: { graphURL: 'https://subgraph.hydrachain.org/subgraphs/name/v3-subgraph', name: 'hydradex-v3' },
  },
  'gliquid': {
    hyperliquid: { graphURL: 'https://api.goldsky.com/api/public/project_cmb20ryy424yb01wy7zwd7xd1/subgraphs/analytics/v1.0.0/gn', name: 'gliquid-hyperliquid' },
  },
  'shido-dex': {
    shido: { graphURL: 'https://ljd1t705przomdjt11587.cleavr.xyz/subgraphs/name/shido/mainnet', name: 'shido-dex' },
  },
  'physica-finance': {
    planq: { graphURL: 'https://subgraph.planq.finance/subgraphs/name/ianlapham/uniswap-v3', name: 'physica-v3' },
  },
  'neby-dex': {
    sapphire: { graphURL: 'https://graph.api.neby.exchange/dex', name: 'Neby Dex' },
  },
  'kinetix-v3': {
    kava: { graphURL: 'https://kava-graph-node.metavault.trade/subgraphs/name/kinetixfi/v3-subgraph', name: 'kinetixfi/kava-v3' },
    base: { graphURL: 'https://api.studio.thegraph.com/query/55804/kinetixfi-base-v3/version/latest', name: 'kinetixfi/base-v3' },
  },
  'iguana-v3': {
    etlk: { graphURL: 'https://api.studio.thegraph.com/query/86688/exchange-v3-etherlink/version/latest', name: 'iguana-etlk' },
  },
  'harmony-swap': {
    harmony: { graphURL: 'GVkp9F6TzzC5hY4g18Ukzb6gGcYDfQrpMpcj867jsenJ', name: 'harmony-swap' },
  },
  'cytoswap': {
    hela: { graphURL: 'https://subgraph.snapresearch.xyz/subgraphs/name/cytoswap-mainnet', name: 'cytoswap-hela' },
  },
}

module.exports = buildProtocolExports(configs, uniV3GraphExportFn)
