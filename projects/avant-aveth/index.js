const ADDRESSES = require('../helper/coreAssets.json')
const AVETH_ADDRESS = "0x9469470C9878bf3d6d0604831d9A3A366156f7EE";
const ETH_ADDRESS   = ADDRESSES.null;

async function tvl(api) {
  const totalSupply = await api.call({ abi: 'erc20:totalSupply', target: AVETH_ADDRESS });
  api.add(ETH_ADDRESS, totalSupply);
}

// Export the adapter
module.exports = {
  methodology: "Calculates TVL by querying the avETH contract's totalSupply function",
  timetravel: true,
  doublecounted: true,
  ethereum: {
    tvl,
  },
};