const VVV = '0xacfE6019Ed1A7Dc6f7B508C02d1b04ec88cC21bf'
const SVVV_STAKING = '0x321b7ff75154472B18EDb199033fF4D116F340Ff'

async function tvl(api) {
  return api.sumTokens({ owner: SVVV_STAKING, tokens: [VVV] })
}

module.exports = {
  methodology: 'Counts the total VVV tokens locked in the Venice Protocol staking contract (sVVV) on Base.',
  base: { tvl },
}
