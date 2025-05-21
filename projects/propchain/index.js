const ADDRESSES = require('../helper/coreAssets.json')

const PROPERTY_TOKENS = [
  "0xfa26e9fC1cB8eA03e133A6aD2c5ef4A817c9D44c",
];

async function tvl(api) {
  const TOKEN_PRICE = 1 // 1 USD

  const supplies = await api.multiCall({
    abi: "erc20:totalSupply",
    calls: PROPERTY_TOKENS,
  });

  supplies.map((supply, i) => api.add(ADDRESSES.polygon.USDC, supply / 1e18 * TOKEN_PRICE * 1e6))
}

module.exports = {
  methodology: "Sums the total supplies of specified Ethereum tokens.",
  polygon: {
    tvl
  },
};
