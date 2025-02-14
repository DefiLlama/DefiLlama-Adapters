const ADDRESSES = require('../helper/coreAssets.json')

async function vaultsTvl(api) {
  const totalSupply = await api.call({ target: ADDRESSES.ethereum.KING, abi: 'uint256:totalSupply' });
  api.add(ADDRESSES.ethereum.KING, totalSupply);
}

module.exports = {
  methodology: 'TVL received directly from the KING contract address. TVL is calculated base on the underlying assets',
  start: 20927127,
  ethereum: {
    tvl: vaultsTvl,
  },
}