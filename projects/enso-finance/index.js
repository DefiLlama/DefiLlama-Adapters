const sdk = require('@defillama/sdk');
const { request, gql } = require('graphql-request');
 
// Enso finance TVL lies for now in the index tokens held by the liquidityMigration contracts
const liquidityMigrationV2_contract = '0x0c6D898ac945E493D25751Ea43BE2c8Beb881D8C';
const graphUrl = 'https://api.thegraph.com/subgraphs/name/ensofinance/enso-liquidity-migration'
const graphQuery = gql`
query GET_WHITELISTED_TOKENS($block: Int) {
  tokens (
    first: 1000
    skip: 0
    block: { number: $block }
  ) {
    id
    name
    stakedAmount
  }
}`

async function tvl(timestamp, block) {
  const { tokens } = await request(
    graphUrl,
    graphQuery, 
    {block}
  );
  const tokens_contracts = tokens.map(t => t.id)
  
  const tokenBalances = await sdk.api.abi.multiCall({
    calls: tokens_contracts.map((t) => ({
      target: t,
      params: [liquidityMigrationV2_contract],
    })),
    abi: 'erc20:balanceOf',
    block,
    chain: 'ethereum',
  })

  const balances = {};
  sdk.util.sumMultiBalanceOf(balances, tokenBalances);
  return balances;
}

module.exports = {
  ethereum: {
    tvl,
  },
  methodology:
    `Get the list of whitelisted index tokens from accepted adapters - TokenSet IndexCoop Indexed PowerPool and PieDAO - and query the amounts held by the vampire LiquidityMigrationV2 contract`,
};