const sdk = require("@defillama/sdk");
const v1 = require('./v1')
const v2 = require('./v2')

module.exports = {
  methodology: 'TVL considers v1 and v2 deposits made to the farming strategies found with the MasterChef contracts and the VaultChef contracts, as well as the liquidity on the DEX that is calculated using the factory address (0x477ce834ae6b7ab003cce4bc4d8697763ff456fa)',
  tvl: sdk.util.sumChainTvls([v1.tvl, v2.tvl]),
};
