const { request, gql } = require("graphql-request");
const sdk = require('@defillama/sdk')

const SUBGRAPH_HONEYSWAP_V2 =
  "https://api.thegraph.com/subgraphs/name/1hive/honeyswap-v2";
const SUBGRAPH_GARDENS_XDAI =
  "https://api.thegraph.com/subgraphs/name/1hive/gardens-xdai";


const balanceAbi = 'function balance(address _token) view returns (uint256)'


const ALL_ORGS_GQL = gql`
  query allOrgs($lastID: ID) {
    organizations(first: 1000, where: { id_gt: $lastID, active: true }) {
      id
      token {
        name
        id
      }
      config {
        conviction {
          requestToken {
            id
            name
          }
          fundsManager
        }
      }
      proposalCount
      active
    }
  }
`;

const ALL_TOKEN_PRICE_QUERY = gql`
  query pricesTokens($tokenAddress: [ID]) {
    tokens(where: { id_in: $tokenAddress }) {
      id
      derivedETH
      tradeVolume
      tradeVolumeUSD
      untrackedVolumeUSD
      totalLiquidity
    }
  }
`;

async function getAllOrgs() {
  let allFound = false;
  let lastID = "";
  let data = [];

  while (!allFound) {
    const orgs = await request(
      SUBGRAPH_GARDENS_XDAI,
      ALL_ORGS_GQL,
      { lastID }
    );

    const numOrgs = orgs.organizations.length;

    if (numOrgs < 1000) {
      allFound = true;
    }
    lastID = orgs.organizations[numOrgs - 1].id;
    data = data.concat(orgs.organizations);
  }
  return data;
}

const chain = 'xdai'

async function tvl(timestamp, _block, { xdai: block }) {
  const balances = {};

  const orgs = await getAllOrgs()
  const calls = orgs.map(org => {
    return { params: org.config.conviction?.requestToken.id, target: org.config.conviction?.fundsManager, }
  }).filter(i => i.params && i.target)

  const { output } = await sdk.api.abi.multiCall({
    abi: balanceAbi,
    calls, chain, block,
    permitFailure: true,
  })

  output.forEach(({ input, output }) => {
    if (output) sdk.util.sumSingleBalance(balances, input.params[0].toLowerCase(), output)
  })

  const tokens = Object.keys(balances)
  const calls2 = tokens.map(i => ({ target: i }))

  const { output: decimals } = await sdk.api.abi.multiCall({
    abi: 'erc20:decimals',
    calls: calls2,
    chain, block,
  })

  decimals.forEach(({ input: { target: token }, output: decimal }) => {
    balances[token] /= 10 ** +decimal
  })

  const tokenPrices = await request(
    SUBGRAPH_HONEYSWAP_V2,
    ALL_TOKEN_PRICE_QUERY,
    { tokenAddress: tokens }
  )

  let tvl = 0

  tokenPrices.tokens.forEach(({ id, totalLiquidity, derivedETH }) => {
    if (+totalLiquidity < 1e4 || !balances[id] || !derivedETH) // if liquidity is below 10k or token not found or price is missing, ignore and move on
      return;
    tvl += +balances[id] * +derivedETH
  })

  return {
    tether: tvl
  }
}

module.exports = {
  methodology:
    '"Uses Gardens and Honeyswap Subgraph to finds USD value of Common Pool treasuries for tokens with greater than $10k of liquidity on Honeyswap"',
  misrepresentedTokens: true,
  xdai: {
    tvl,
  },
};