const ADDRESSES = require('../helper/coreAssets.json')
const SFLR = ADDRESSES.flare.sFLR;

async function tvl(api) {
  const pooledFlr = await api.call({ abi: "uint256:totalPooledFlr", target: SFLR })
  api.addGasToken(pooledFlr)
}

module.exports = {
  flare: {
    tvl,
  },
  methodology: "Counts staked FLR tokens.",
}