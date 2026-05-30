const ADDRESSES = require('../helper/coreAssets.json')

const PROTOCOL_CONTRACTS = [
  // wrappedCollateral
  "0x4e9608d5cf77f22b2d5543b6c65a8c5417e8122c",
  "0xC7E015B63d8226444A028c57fcaa1d30bfC3178C",
  // conditionalTokens
  "0xc83C5Cca746D213D9Cf63FE668E7EB8dEe35314B",
  "0xb365835F194E383354367572D0eB9d2Dce46b693", 
];

async function tvl(api) {
  return api.sumTokens({
    owners: PROTOCOL_CONTRACTS,
    tokens: [ADDRESSES.base.USDC],
  });
}

module.exports = {
  methodology: "USDC held in the ConditionalTokens contract plus USDC held in the NegRisk WrappedCollateral contract.",
  base: { tvl },
};
