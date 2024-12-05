const { sumTokens2 } = require('../helper/unwrapLPs')
const tokens = require('./tokens.json')

async function stakedLPsTVL() {
  const stakerAddress = '0x54De3b7b5D1993Db4B2a93C897b5272FBd60e99E'
  return await sumTokens2({
    owner: stakerAddress,
    chain: "arbitrum",
    resolveUniV3: true,
    tokens,
  })
}

async function burntHermesTVL() {
  const bHermesAddress = '0x3A0000000000E1007cEb00351F65a1806eCd937C'
  return await sumTokens2({
    owner: bHermesAddress,
    chain: "arbitrum",
    resolveUniV3: true,
    tokens: ['0x45940000009600102A1c002F0097C4A500fa00AB']
  })
}

module.exports = {
  misrepresentedTokens: true,
  methodology: 'The sum of All staked Uniswap V3 NFTs and burnt Hermes for staked TVL.',
  arbitrum: {
    tvl: stakedLPsTVL,
    staking: burntHermesTVL,
  },
};
