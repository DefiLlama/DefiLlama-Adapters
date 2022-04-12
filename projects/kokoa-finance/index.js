const retry = require('async-retry')
const axios = require("axios");
const BigNumber = require("bignumber.js");
const { toUSDTBalances } = require('../helper/balances');

async function fetchCollateralAndLiquidity() {
  const kokoaCollateralInfo = await retry(async bail => await axios.get('https://kokoa-mainnet.du.r.appspot.com/collateral'));
  const collateralInfo = kokoaCollateralInfo.data;
  var totalCollateral = new BigNumber('0');

  // Collateral
  for (const collateral of collateralInfo) {
    totalCollateral = totalCollateral.plus(collateral.collateralPrice*collateral.totalLockedCollateral / (10 ** collateral.decimal));
  }

  // Staked Liquidity
  const kokoaStatusInfo = (await retry(async bail => await axios.get('https://kokoa-mainnet.du.r.appspot.com/status/')));
  const LiquidityInfo = kokoaStatusInfo.data.farms;
  var totalLiquidity = new BigNumber('0');

  for (const liquidity of LiquidityInfo) {
    totalLiquidity = totalLiquidity.plus(liquidity.lpTokenPrice * liquidity.totalSupply / 1e18);
  }

  return toUSDTBalances(totalCollateral.plus(totalLiquidity).toFixed(2));
}


async function fetchStakedToken() {
  const kokoaInfo = (await retry(async bail => await axios.get('https://kokoa-mainnet.du.r.appspot.com/status/'))).data;
  const totalStaking = new BigNumber(kokoaInfo.govern.volume * kokoaInfo.KOKOA.price / 1e18);
  return toUSDTBalances(totalStaking.toFixed(2));
}

module.exports = {
  methodology: 'TVL counts the 1) Collateral deposited 2) liquidity staked and 3) staked KOKOA. Data is pulled from:"https://kokoa-mainnet.du.r.appspot.com/status" and "https://kokoa-mainnet.du.r.appspot.com/collateral".',
  klaytn: {
    tvl: fetchCollateralAndLiquidity,
    staking: fetchStakedToken
  },
  misrepresentedTokens: true,
  timetravel: false,
}