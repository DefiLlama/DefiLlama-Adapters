const ADDRESSES = require('../helper/coreAssets.json');

const lronContract = ADDRESSES.ronin.LRON;

async function lron(api) {
  const bal = await api.call({  abi: 'uint256:totalAssets', target: lronContract})
  api.addGasToken(bal)
}

module.exports = {
  ronin: {
    tvl: lron
  },
}