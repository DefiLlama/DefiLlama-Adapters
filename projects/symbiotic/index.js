const COLLATERALS = [
  '0xC329400492c6ff2438472D4651Ad17389fCb843a',
  '0xB26ff591F44b04E78de18f43B46f8b70C6676984',
  '0x422F5acCC812C396600010f224b320a743695f85',
  '0x03Bf48b8A1B37FBeAd1EcAbcF15B98B924ffA5AC',
  '0x475D3Eb031d250070B63Fa145F0fCFC5D97c304a',
  '0x38B86004842D3FA4596f0b7A0b53DE90745Ab654',
  '0x5198CB44D7B2E993ebDDa9cAd3b9a0eAa32769D2',
  '0xBdea8e677F9f7C294A4556005c640Ee505bE6925',
]

async function tvl(_, _1, _2, { api }) {
  const tokens = await api.multiCall({
    abi: 'address:asset',
    calls: COLLATERALS,
  })

  const balances = await api.multiCall({
    abi: 'erc20:balanceOf',
    calls: tokens.map((token, i) => ({
      target: token,
      params: [COLLATERALS[i]],
    })),
  })

  tokens.forEach((token, i) => {
    api.add(token, balances[i])
  })
}

module.exports = {
  start: 1718088924,
  ethereum: {
    tvl,
  },
}
