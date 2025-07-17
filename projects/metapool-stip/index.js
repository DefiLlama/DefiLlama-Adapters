
const { sumTokens2 } = require('../helper/unwrapLPs')

const stakedIpAddress = '0xd07Faed671decf3C5A6cc038dAD97c8EFDb507c0'

async function tvl(api) {
  const ipToken = await api.call({
    target: stakedIpAddress,
    abi: 'address:asset',
  })

  const stakedIpAmount = await api.call({
    target: stakedIpAddress,
    abi: 'uint256:totalAssets',
  })

  api.add(ipToken, stakedIpAmount)

  return sumTokens2({ api })
}

module.exports = {
  methodology:
    "TVL is the total IP tokens backing the stIP token in the Staked IP contract.",
  sty: { tvl },
}
