const { sumTokens2 } = require('../helper/unwrapLPs')

async function tvl(api) {
  const farms = await api.call({
    target: '0x45bC6B44107837E7aBB21E2CaCbe7612Fce222e0',
    abi: 'function getFarmList() view returns (address[])',
  })
  const rewardTokens = await api.multiCall({
    calls: farms.map(farm => ({ target: farm })),
    abi: 'function getTokenAmounts() view returns (address[], uint256[])',
  })
  // console.log(rewardTokens)
  const toa = []
  const tob = []
  rewardTokens.forEach((tokens, i) => {
    tokens[0].forEach((token,j ) => {
      toa.push([token, farms[i]])
    })
  })
  rewardTokens.forEach((amounts, i) => {
    amounts[1].forEach((amount, j) => {
      tob.push([amount, farms[i]])
    })
  })

  await sumTokens2({ api, owners: farms, tokenAmounts: tob })
  

  return sumTokens2({ api, tokensAndOwners: toa })
}

module.exports = {
  arbitrum:{tvl},
}