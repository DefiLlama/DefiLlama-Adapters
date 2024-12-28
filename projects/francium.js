const { get } = require('./helper/http')
async function fetch() {
  const response = (
    await get("https://francium-data.s3-us-west-2.amazonaws.com/tvl/liquidity.json")
  ).data;

  const poolLiqArray = response.farm.map(pool => pool.liquidityLocked);
  const lendArray = response.lend.map(pool => pool.available);
  const tvl = [...poolLiqArray, ...lendArray, response.old].reduce((a, b) => a + b, 0);

  return tvl;
}

module.exports = {
  hallmarks:[
    [1667865600, "FTX collapse"]
  ],
  timetravel: false,
  methodology: 'Value of total LP tokens locked + deposits that are not borrowed.',
  fetch,
};
