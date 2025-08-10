const { get } = require('./helper/http')

const url = "https://francium-data.s3-us-west-2.amazonaws.com/tvl/liquidity.json"

const tvl = async (api) => {
  const { data } = await get(url)
  const poolLiqArray = data.farm.map(pool => pool.liquidityLocked);
  const lendArray = data.lend.map(pool => pool.available);
  const tvl = [...poolLiqArray, ...lendArray, data.old].reduce((a, b) => a + b, 0);
  return api.addUSDValue(Math.round(tvl))
}

module.exports = {
  hallmarks:[[1667865600, "FTX collapse"]],
  misrepresentedTokens: true,
  timetravel: false,
  methodology: 'Value of total LP tokens locked + deposits that are not borrowed.',
  solana: { tvl },
};
