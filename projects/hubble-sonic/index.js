const { staking } = require('../helper/staking')

const HUBBLE = '0xd441a37aA73fc1DDd2db99FC4c92f233b7d41CBd'
const EX = '0xd4d197F3397C8F28f4BC2C698104CfbCC3e04802'
const XHUBBLE = '0x14D1Db2367312Ee3BBA54905b64f3bf0f0D677A8' // locked HUBBLE
const XEX = '0x13a67513c56c9E90D09d4163d233DaD819c2FC87' // locked EX
const STS = '0xE5DA20F15420aD15DE0fa650600aFc998bbE3955'

const MISSION_CONTROL = '0xd268e36Ea3c1948284D40855cc2C26A71Ad07095'
const REDEEMER = '0x3C3cC567b7c8f98e7BD244E575FdE61016ef66B5'

const HUBBLE_USDC_LP = '0x9ff1b68f8bedF4665fE358F92C3E9aF386cb295f'
const EX_STS_LP = '0x37be2fF30Efde8c05E8E4A59486Db82AEBC5d892'

async function tvl(api) {
  const redemptionPool = await api.call({ target: REDEEMER, abi: 'address:redemptionPool' })
  return api.sumTokens({ owner: redemptionPool, tokens: [STS] })
}

// Mission Control's share of each pair's token balances. The Shadow LPs have an empty symbol(),
// so resolveLP does not recognise them as LPs.
async function pool2(api) {
  const lps = [HUBBLE_USDC_LP, EX_STS_LP]
  const token0s = await api.multiCall({ abi: 'address:token0', calls: lps })
  const token1s = await api.multiCall({ abi: 'address:token1', calls: lps })
  const supplies = await api.multiCall({ abi: 'erc20:totalSupply', calls: lps })
  const staked = await api.multiCall({ abi: 'erc20:balanceOf', calls: lps.map(lp => ({ target: lp, params: MISSION_CONTROL })) })
  const tokens = lps.flatMap((lp, i) => [[token0s[i], lp], [token1s[i], lp]])
  const pairBalances = await api.multiCall({ abi: 'erc20:balanceOf', calls: tokens.map(([token, lp]) => ({ target: token, params: lp })) })
  tokens.forEach(([token], j) => {
    const i = Math.floor(j / 2)
    api.add(token, BigInt(pairBalances[j]) * BigInt(staked[i]) / BigInt(supplies[i]))
  })
}

module.exports = {
  methodology: "TVL is the stS held in Hubble's active EX redemption pool. Staking is the HUBBLE and EX locked in xHUBBLE and xEX. Pool2 is the HUBBLE/USDC and EX/stS LP staked in Mission Control.",
  sonic: {
    tvl,
    staking: staking([XHUBBLE, XEX], [HUBBLE, EX]),
    pool2,
  },
}
