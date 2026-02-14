const PRIZE_VAULTS = [
  '0x9d9a8a51d3f1b2465a9f2d2729405a63fd044a09', // ShiYoUSD
  '0x738b1c666C1ae19adE14a8A73562B655746353B0', // ShiYoETH
  '0x11332d33da296dE34DDa4D0A37ce3303d80f6b61', // ShiYoEUR
  '0x25d99a29463aa85909687985fb58b4406fca7fe3', // ShiYoBTC
];

async function tvl(api) {
  const assets = await api.multiCall({
    abi: 'address:asset',
    calls: PRIZE_VAULTS,
  });

  const totalAssets = await api.multiCall({
    abi: 'uint256:totalAssets',
    calls: PRIZE_VAULTS,
  });

  api.addTokens(assets, totalAssets);
}

module.exports = {
  methodology: "TVL is the total assets deposited in Shinjo prize vaults, measured via the ERC4626 totalAssets() function on each vault.",
  base: {
    tvl,
  },
};
