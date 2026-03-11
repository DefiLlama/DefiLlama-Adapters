const coreAssets = require('../helper/coreAssets.json');

const ethereumOAdapterUpgradeable = "0x6C96dE32CEa08842dcc4058c14d3aaAD7Fa41dee";

async function tvl(api) {
  const balance = await api.call({
    abi: 'erc20:balanceOf',
    target: coreAssets.ethereum.USDT,
    params: [ethereumOAdapterUpgradeable],
  });

  api.add(coreAssets.ethereum.USDT, balance);
}

module.exports = {
  start: 1736351639,
  ethereum: {
    tvl,
  },
};
