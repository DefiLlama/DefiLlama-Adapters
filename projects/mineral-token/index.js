const { toUSDTBalances } = require('../helper/balances');

const MXTK_PROXY = '0x3e4Ffeb394B371AAaa0998488046Ca19d870d9Ba';

async function tvl(api) {
  const totalAssetValue = await api.call({
    target: MXTK_PROXY,
    abi: 'function totalAssetValue() view returns (uint256)',
  });
  // totalAssetValue is USD x 1e18 (MXTK convention: values are dollars x 1e18).
  // toUSDTBalances takes whole dollars and scales to USDT 6-decimal units;
  // sub-dollar dust is truncated, immaterial at this scale.
  const dollars = (BigInt(totalAssetValue) / 10n ** 18n).toString();
  return toUSDTBalances(dollars);
}

module.exports = {
  methodology:
    'Reads totalAssetValue() (USD x 1e18) from the MXTK UUPS proxy on Arbitrum One and reports it as USD TVL. All data comes from chain state; no API fetching.',
  misrepresentedTokens: true,
  arbitrum: {
    tvl,
  },
};

// node test.js projects/mineral-token/index.js
