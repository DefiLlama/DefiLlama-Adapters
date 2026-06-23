const ADDRESSES = require('../helper/coreAssets.json')

const PROTOCOL_CONTRACTS = [
  // wrappedCollateral (latest)
  "0x76c175e7ad7f794e2478345ee50d8290088a797d",
  // wrappedCollateral (legacy)
  "0x4e9608d5cf77f22b2d5543b6c65a8c5417e8122c",
  "0xc7e015b63d8226444a028c57fcaa1d30bfc3178c",
  // conditionalTokens (latest)
  "0xa291d33e4670ab6bcd2c631231396ef12e138380",
  // conditionalTokens (legacy)
  "0xc83c5cca746d213d9cf63fe668e7eb8dee35314b",
  "0xb365835f194e383354367572d0eb9d2dce46b693",
];

async function tvl(api) {
  return api.sumTokens({
    owners: PROTOCOL_CONTRACTS,
    tokens: [ADDRESSES.base.USDC],
  });
}

module.exports = {
  methodology:
    "USDC held in ConditionalTokens contracts and NegRisk WrappedCollateral contracts (latest and legacy deployments).",
  base: { tvl },
};
