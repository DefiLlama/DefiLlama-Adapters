const ADDRESSES = require('../helper/coreAssets.json')
const posStaking = ADDRESSES.thundercore.veTT

async function tvl(api) {
  const ttTvl = await api.call({ target: posStaking, abi: "uint256:getTTPool", });
  api.addGasToken(ttTvl)
}

module.exports = {
  methodology: 'calculate the total amount of TT locked in the veTT contract',
  thundercore: {
    tvl,
  },
}