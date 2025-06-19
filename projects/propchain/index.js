const ADDRESSES = require('../helper/coreAssets.json')

const PROPERTY_TOKENS = [
  "0xfa26e9fC1cB8eA03e133A6aD2c5ef4A817c9D44c",
  "0xF6e4F43C1c5F6654D1873577904070b39ca396e6"
];

async function tvl(api) {
  const TOKEN_PRICE = 1 // 1 USD

  const supplies = await api.multiCall({
    abi: "erc20:totalSupply",
    calls: PROPERTY_TOKENS,
  });

  supplies.map((supply) => api.add(ADDRESSES.polygon.USDC, supply / 1e18 * TOKEN_PRICE * 1e6))
}

module.exports = {
  methodology: "Sums the total supplies of specified Polygon tokens.",
  polygon: {
    tvl
  },
};
