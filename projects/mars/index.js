const sdk = require('@defillama/sdk')

const { queryContract } = require('../helper/chain/cosmos')
const { transformBalances } = require('../helper/portedTokens')
const { sumTokensExport } = require('../helper/sumTokens')
const chain = 'osmosis'
const contract = 'osmo1c3ljch9dfw5kf52nfwpxd2zmj2ese7agnx0p9tenkrryasrle5sqf3ftpg'

async function borrowed() {
  const res = await queryContract({ contract, chain: 'osmosis', data: { markets: { limit: 10 } } })
  const borrowed = {};
  res.forEach(i => {
    sdk.util.sumSingleBalance(borrowed, i.denom, i.debt_total_scaled * i.borrow_index / 1e6)
  })

  return transformBalances(chain, borrowed)
}

module.exports = {
  timetravel: false,
  methodology: "sum up token balances in Mars smart contract in osmosis",
  osmosis: {
    tvl: sumTokensExport({ owner: contract }),
    borrowed,
  },
  terra: {
    tvl: () => 0,
  },
   hallmarks:[
    [1651881600, "UST depeg"],
    [1675774800, "Relaunch on Osmosis"],
  ]
};
