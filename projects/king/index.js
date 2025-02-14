const ADDRESSES = require('../helper/coreAssets.json')

async function mainnetTVL(api) {
  const totalSupply = await api.call({ target: ADDRESSES.ethereum.KING, abi: 'uint256:totalSupply' });
  api.add(ADDRESSES.ethereum.KING, totalSupply);
}

async function swellTVL(api) {
  const totalSupply = await api.call({ target: ADDRESSES.swellchain.KING, abi: 'uint256:totalSupply' });
  api.add(ADDRESSES.swellchain.KING, totalSupply);
}

module.exports = {
  methodology: 'TVL received directly from the KING contract address. TVL is calculated base on the underlying assets',
  start: 20927127,
  ethereum: {
    tvl: mainnetTVL,
  },
  swellchain: {
    tvl: swellTVL
  }
}