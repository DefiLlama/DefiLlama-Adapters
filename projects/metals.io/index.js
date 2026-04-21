const TOKENS = {
  VNXAU: '0x93F5475da60143C50e8bE3fED10c143B0CF8b9E9',
  xU3O8: '0x79052Ab3C166D4899a1e0DD033aC3b379AF0B1fD',
  RARE:  '0x6Ce393fF9Ed5465CC4DEf456B8401e03cEF64d5e',
}

async function tvl(api) {
  const supplies = await api.multiCall({
    abi: 'uint256:totalSupply',
    calls: Object.values(TOKENS),
  })
  Object.values(TOKENS).forEach((token, i) => api.add(token, supplies[i]))
}

module.exports = {
  methodology: 'Counts the total supply of all metals.io RWA tokens (VNXAU, xU3O8, RARE) on Etherlink',
  etlk: {
    tvl,
  },
}
