const sdk = require('@defillama/sdk');

const vaults = [
  '0x781FB7F6d845E3bE129289833b04d43Aa8558c42',
  '0xF5C81d25ee174d83f1FD202cA94AE6070d073cCF',
  '0xfD06859A671C21497a2EB8C5E3fEA48De924D6c8',
  '0x3F33F9f7e2D7cfBCBDf8ea8b870a6E3d449664c2',
]

async function tvl(api) {
  const balances = {};

  const assets = await api.multiCall({ abi: 'address:asset', calls: vaults })
  const totalAssets = await api.multiCall({ abi: 'uint256:totalAssets', calls: vaults })   

  assets.forEach((asset, index) => {
    sdk.util.sumSingleBalance(balances, asset, totalAssets[index], api.chain)
  });

  return balances;
}

module.exports = {
  // because all assets are deposited into Morpho Blue
  doublecounted: true,
  methodology: 'Count total assets are deposited in Morpho Blue vaults.',
  start: 1741219200, // 2025-03-06
  polygon: {
    tvl,
  },
};
