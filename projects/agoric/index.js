const { post } = require('../helper/http')

const query = `
query {
  vaultManagerMetrics {
    nodes {
      liquidatingCollateralBrand
      totalCollateral
    }
  }
  oraclePrices {
    nodes {
      typeInAmount
      typeOutAmount
      typeInName
    }
  }
  boardAuxes {
    nodes {
      allegedName
      decimalPlaces
    }
  }
}
`

const coingeckoMapping = {
  'stATOM': 'stride-staked-atom',
  'stkATOM': 'stkatom',
  'ATOM': 'cosmos',
  'stOSMO': 'stride-staked-osmo',
  'stTIA': 'stride-staked-tia',
  'dATOM': 'drop-staked-atom',
}
const decimals = {}

const tvl = async (api) => {
  const { data: { vaultManagerMetrics, boardAuxes } } = await post('https://api.subquery.network/sq/agoric-labs/agoric-mainnet-v2', { query })

  boardAuxes.nodes.forEach(board => {
    decimals[board.allegedName] = 10 ** board.decimalPlaces
  })

  vaultManagerMetrics.nodes.forEach(vault => {
    const key = vault.liquidatingCollateralBrand
    if (!coingeckoMapping[key]) {
      throw new Error(`Unknown coin ${key} (coingecko mapping is missing)`)
    }
    const decimal = decimals[key] ?? 1e6
    const balance = vault.totalCollateral / decimal
    api.addCGToken(coingeckoMapping[key], balance)
  })
}

module.exports = {
  agoric: {
    tvl,
  },
}
