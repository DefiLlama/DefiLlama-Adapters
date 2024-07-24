const { sumTokens } = require("../helper/chain/starknet");
const { getConfig } = require('../helper/cache')

const factory = // myswap cl version amm contract
  "0x1114c7103e12c2b2ecbd3a2472ba9c48ddcbf702b1c242dd570057e26212111";

async function tvl(api) {
  const tokenList  = await getConfig( // get token list from api // 0 padded
    'myswap-cl', "https://myswap-cl-charts.s3.us-east-1.amazonaws.com/tokenList.json");

  const tokens = Object.values(tokenList);

  return sumTokens({ api, owner: factory, tokens: tokens, });
}

module.exports = {
  starknet: {
    tvl,
  },
};
