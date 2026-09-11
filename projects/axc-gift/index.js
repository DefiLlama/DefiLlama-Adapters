const bscTokens = [
  "0x6Eca9D3B1ef79F5b45572fb8204835C6A4502bE9", // GIFT
];

async function getTokensTvl(api, tokens) {
  const supplies = await api.multiCall({ abi: 'erc20:totalSupply', calls: tokens })
  api.add(tokens, supplies)
  return api.getBalances()
}

module.exports = {
  bsc: {
    tvl: (api) => getTokensTvl(api, bscTokens)
  },
  hallmarks: [
    ["2025-12-31", "Grow Institutional Fund Token (GIFT) is a RWA token which seeks to track the value of the Grow Heritage Fund"]
  ]
};
