const { getConfig } = require('../helper/cache')
const { sumERC4626Vaults } = require('../helper/erc4626');
const { sumTokens2 } = require('../helper/unwrapLPs');

const POOL_API_URL = "https://firoza.finance/api/pools";

async function tvl(api) {
  const poolAddresses = await getConfig('firoza', POOL_API_URL);
  await sumERC4626Vaults({ api, calls: poolAddresses, isOG4626: true, });
  return sumTokens2({ api })
}

module.exports = {
  methodology: "TVL counts the tokens deposited in the Firoza Finance pools.",
  islm: { tvl },
  hallmarks: [
    [1688169600, "Launch on ISLM"]
  ],
};