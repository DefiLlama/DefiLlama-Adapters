const { createIncrementArray } = require('../helper/utils');
const { sumTokens2 } = require('../helper/unwrapLPs');
const { staking } = require('../helper/staking');

const POTION_VAULT_CONTRACT = '0xd5e31fc5f4a009A49312C20742DF187b35975528';
const POISON_TOKEN_CONTRACT = '0x31C91D8Fb96BfF40955DD2dbc909B36E8b104Dde';
const POISON_STAKED_CONTRACT = '0xDA016d31f2B52C73D7c1956E955ae8A507b305bB';

const abi = {
  "tokenInfo": "function tokenInfo(uint256) view returns (address stableToken, uint256 underlyingContractDecimals, bool canMint)",
}

async function tvl(_, _b, _cb, { api, }) {
  const calls = createIncrementArray(5)
  const tokensInfo = await api.multiCall({ abi: abi.tokenInfo, calls, target: POTION_VAULT_CONTRACT })
  return sumTokens2({ api, owner: POTION_VAULT_CONTRACT, tokens: tokensInfo.map(i => i.stableToken) })
}

module.exports = {
  arbitrum: {
    tvl,
    staking: staking(POISON_STAKED_CONTRACT, POISON_TOKEN_CONTRACT),
  }
};









