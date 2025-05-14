const ADDRESSES = require('../helper/coreAssets.json')

const PROPERTY_TOKENS = [
  "0x0B2d417f5Fa68BBC9ecb996a710F560B7023a1E3",
  "0xb95832359652EEBF4bAed221d0B789a7aB3d178f",
  "0xfa26e9fC1cB8eA03e133A6aD2c5ef4A817c9D44c",
  "0xF6e4F43C1c5F6654D1873577904070b39ca396e6",
  "0x45b693C545CC0989cdCfb7186Cd318da0B266E34",
  "0x68C875D6D1F953B5b3e34b0Fe1b40327C4FB45df",
  "0x580997c88896FE561D90a5Dd5886211E972026E4",
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
