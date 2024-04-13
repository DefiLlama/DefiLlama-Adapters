const ADDRESSES = require('../helper/coreAssets.json')
async function tvl(api) {
  const bal = await api.call({
    abi: "uint256:totalAssets",
    target: '0xea1a6307d9b18f8d1cbf1c3dd6aad8416c06a221',
  });
  api.add(ADDRESSES.ethereum.EETH, bal);
}

module.exports = {
  doublecounted: true,
  ethereum: {
    tvl,
  },
};
