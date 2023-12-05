const { sumTokens } = require("../helper/chain/starknet");
const { default: axios } = require("axios");

const factory = // myswap cl version amm contract
  "0x1114c7103e12c2b2ecbd3a2472ba9c48ddcbf702b1c242dd570057e26212111";

async function calculate_tvl(_, _1, _2, { api }) {
  const { data: tokenList } = await axios.get( // get token list from api // 0 padded
    "https://myswap-cl-charts.s3.us-east-1.amazonaws.com/tokenList.json"
  );
  
  const tokens = Object.values(tokenList);
  
  return sumTokens({
    api,
    owner: factory,
    tokens: tokens,
  });
}

module.exports = {
  starknet: {
    tvl: calculate_tvl,
  },
};
