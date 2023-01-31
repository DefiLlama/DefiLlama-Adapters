const sdk = require("@defillama/sdk");

async function sumTvl({ balances, cellars, api }) {
  const assets = await api.multiCall({  abi: "address:asset", calls: cellars}) 
  const bals = await api.multiCall({  abi: "uint256:totalAssets", calls: cellars})
  assets.forEach((a, i) => sdk.util.sumSingleBalance(balances,a,bals[i], api.chain))
  return balances
}

module.exports = {
  sumTvl,
};
