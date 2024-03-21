const { createIncrementArray } = require('../helper/utils');
const { sumTokens2 } = require('../helper/unwrapLPs');
const { staking } = require('../helper/staking');


const config = {
  arbitrum: { vault: '0xd5e31fc5f4a009A49312C20742DF187b35975528', token: '0x31C91D8Fb96BfF40955DD2dbc909B36E8b104Dde', stakingContract: '0xDA016d31f2B52C73D7c1956E955ae8A507b305bB', poolCount: 5 },
  bsc: { vault: '0xd5e31fc5f4a009A49312C20742DF187b35975528', token: '0x31C91D8Fb96BfF40955DD2dbc909B36E8b104Dde', stakingContract: '0x04fCB69aa48f9151741A5D238b5c3cDb2A788e05', poolCount: 5 },
}

const abi = {
  "tokenInfo": "function tokenInfo(uint256) view returns (address stableToken, uint256 underlyingContractDecimals, bool canMint)",
}

async function tvl(api) {
  const { poolCount, vault } = config[api.chain]
  const calls = createIncrementArray(poolCount)
  const tokensInfo = await api.multiCall({ abi: abi.tokenInfo, calls, target: vault })
  return sumTokens2({ api, owner: vault, tokens: tokensInfo.map(i => i.stableToken) })
}

module.exports = {};

Object.keys(config).forEach(chain => {
  const { token, stakingContract, } = config[chain]
  module.exports[chain] = { tvl }
  if (stakingContract && token) module.exports[chain].staking = staking(stakingContract, token)
})









