const BigNumber = require("bignumber.js");
const { getBalanceNumber } = require('./format');
const sdk = require("@defillama/sdk");
const chains = require('./constants/chain');

require("dotenv").config();

const fetchPublicVaultData = require("./vault");
const fetchFarms = require('./farm');
const { fetchPoolsTotalStaking } = require('./pool');

function getChainTvl(chain) {
  return function (timestamp, _ethBlock, chainBlocks) {
    return getTvl(chain, timestamp, _ethBlock, chainBlocks);
  };
}

async function getTvl(chain, timestamp, _ethBlock, chainBlocks) {
  const block = chainBlocks ? chainBlocks[chain] : null;
  const chainPid = {
    kcc: 1,
    bsc: 3
  };

  const chainId = chains[chain];
  const [vData, pools, farmsLP] = await Promise.all([
    fetchPublicVaultData(chain, block),
    fetchPoolsTotalStaking(chain, block),
    fetchFarms(chain, block),
  ]);

  const totalCakeInVault = new BigNumber(vData.totalCakeInVault);
  const woofLp = farmsLP.filter(_ => _.pid == chainPid[chain])[0];
  const woofPrice = new BigNumber(woofLp.token.busdPrice);

  const farmsLiquidity = farmsLP
    .map((farm) => {
      if (
        farm.pid !== 0 &&
        farm.multiplier !== "0X" &&
        farm.lpTotalInQuoteToken &&
        farm.quoteToken.busdPrice
      ) {
        return new BigNumber(farm.lpTotalInQuoteToken).times(
          farm.quoteToken.busdPrice
        );
      }
      return null;
    })
    .filter((liquidity) => !!liquidity)
    .reduce((a, b) => a.plus(b));

  let poolsStaked = null;

  if (woofPrice.gt(0) && totalCakeInVault.gt(0)) {
    const staked = pools.map((pool) => {
      if (pool.sousId === 0) {
        return new BigNumber(pool.totalStaked)
          .minus(totalCakeInVault)
          .times(woofPrice);
      }
      return new BigNumber(pool.totalStaked).times(woofPrice);
    });
    poolsStaked = staked.reduce((a, b) => a.plus(b));
  }

  const tvl =
    farmsLiquidity && totalCakeInVault && poolsStaked
      ? farmsLiquidity
          .plus(
            getBalanceNumber(
              totalCakeInVault.times(woofPrice).plus(poolsStaked),
              18
            )
          )
      : null;

  const baseToken = woofLp.token.address[chainId];
  const balances = {};
  balances[`${chain}:${baseToken}`] = tvl.div(woofPrice).toNumber();
  // console.log(balances, woofPrice.toJSON(), tvl.toNumber());

  return tvl.toNumber();
}

// (async () => {
//   try {
//     console.log(await getTvl('kcc'));
//   } catch(e) {
//     console.log(e.stack)
//   }
// })();

module.exports = {
  misrepresentedTokens: true,
  methodology: "We count liquidity on the dexes, pulling data from onchain",
  fetch: getChainTvl("bsc"),
  // kcc: {
  //   tvl: getChainTvl("kcc"),
  // },
  // bsc: {
  //   tvl: getChainTvl("bsc"),
  // },
  // tvl: sdk.util.sumChainTvls([getChainTvl("kcc"), getChainTvl("bsc")]),
};