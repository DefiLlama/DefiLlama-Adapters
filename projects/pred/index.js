const ADDRESSES = require('../helper/coreAssets.json')

const PROTOCOL_CONTRACTS = [
  "0xC7E015B63d8226444A028c57fcaa1d30bfC3178C", // wrappedCollateral
  "0xb365835F194E383354367572D0eB9d2Dce46b693", // conditionalTokens
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
