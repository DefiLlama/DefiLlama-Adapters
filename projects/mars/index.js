const sdk = require('@defillama/sdk')

const { queryContract } = require('../helper/chain/cosmos')
const { transformBalances } = require('../helper/portedTokens')
const { sumTokensExport } = require('../helper/sumTokens')
const chain = 'osmosis'
const contract = 'osmo1c3ljch9dfw5kf52nfwpxd2zmj2ese7agnx0p9tenkrryasrle5sqf3ftpg'

async function queryRedBankTvl() {
  const res = await queryContract({ contract, chain: 'osmosis', data: { markets: {} } })

  const tvl = {};
  const borrowed = {};
  res.forEach(i => {
    sdk.util.sumSingleBalance(tvl, i.denom, i.collateral_total_scaled / 1e6 - i.debt_total_scaled / 1e6)
    sdk.util.sumSingleBalance(borrowed, i.denom, i.debt_total_scaled * i.borrow_index / 1e6)
  })

  return { tvl: transformBalances(chain, tvl), borrowed: transformBalances(chain, borrowed) };
}

module.exports = {
  timetravel: false,
  methodology: "We query Mars protocol smart contracts to get the amount of assets deposited and borrowed, then use CoinGecko to price the assets in USD.",
  osmosis: {
    tvl: sumTokensExport({ owner: contract }),
    borrowed: async () => (await queryRedBankTvl()).borrowed,
  },
  hallmarks: [
    [1651881600, "UST depeg"],
    [1675774800, "Relaunch on Osmosis"],
  ],
};
