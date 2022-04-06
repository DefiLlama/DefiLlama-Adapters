const sdk = require('@defillama/sdk')
const abi = require('./abi.json')
const { sumTokens } = require('../helper/unwrapLPs')
const { staking } = require('../helper/staking')

const stkTRU = '0x23696914Ca9737466D8553a2d619948f548Ee424'
const TRU = '0x4C19596f5aAfF459fA38B0f7eD92F11AE6543784'

async function tvl(ts, block) {
  const pools = [
    '0x97cE06c3e3D027715b2d6C22e67D5096000072E5', // TUSD
    '0x6002b1dcB26E7B1AA797A17551C6F487923299d7', // USDT
    '0xA991356d261fbaF194463aF6DF8f0464F8f1c742', // USDC
    '0x1Ed460D149D48FA7d91703bf4890F97220C09437', // BUSD
  ]

  const tokens = (await sdk.api.abi.multiCall({
    calls: pools.map(target => ({ target })),
    abi: abi.token,
    block: block
  })).output

  const balances = {}
  const tokensAndOwners = pools.map((owner, i) => [tokens[i].output, owner])
  await sumTokens(balances, tokensAndOwners, block)
  return balances
}

module.exports = {
  start: 1605830400,            // 11/20/2020 @ 12:00am (UTC)
  ethereum: { 
    tvl,
    staking: staking(stkTRU, TRU, 'ethereum')
  }
}