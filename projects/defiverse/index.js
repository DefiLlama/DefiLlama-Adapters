const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

const VAULT_CONTRACT = "0x2FA699664752B34E90A414A42D62D7A8b2702B85";
const TOKENS = [
  ADDRESSES.defiverse.USDC,
  ADDRESSES.base.DAI,
  ADDRESSES.defiverse.ETH,
  ADDRESSES.defiverse.OAS,
];

async function tvl(api) {
  const tokenAddesses = TOKENS.map((x) => x.address);
  return sumTokens2({ api, owner: VAULT_CONTRACT, tokens: TOKENS });
}

module.exports = {
  defiverse: {
    tvl,
  },
};
