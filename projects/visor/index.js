const sdk = require("@defillama/sdk");
const hypervisorAbi = require("./abis/hypervisor.json");
const { staking } = require("../helper/staking");
const { request, gql } = require("graphql-request");

const getTotalAmounts = "function getTotalAmounts() view returns (uint256 total0, uint256 total1)"
const hypeRegistry = require("./abis/hypeRegistry.json");
const { getUniqueAddresses } = require("../helper/utils");

//get their pool addresses from the subgraph
const GRAPH_URL = {
  ethereum: "https://api.thegraph.com/subgraphs/name/gammastrategies/gamma",
  polygon: "https://api.thegraph.com/subgraphs/name/gammastrategies/polygon",
  optimism: "https://api.thegraph.com/subgraphs/name/gammastrategies/optimism",
  arbitrum: "https://api.thegraph.com/subgraphs/name/gammastrategies/arbitrum",
  celo: "https://api.thegraph.com/subgraphs/name/gammastrategies/celo",
  algebra_polygon: "https://api.thegraph.com/subgraphs/name/gammastrategies/algebra-polygon",
};

const HYPE_REGISTRY = {
  ethereum: "0x31ccdb5bd6322483bebd0787e1dabd1bf1f14946",
  polygon: "0x0Ac4C7b794f3D7e7bF1093A4f179bA792CF15055",
  optimism: "0xF5BFA20F4A77933fEE0C7bB7F39E7642A070d599",
  arbitrum: "0x66CD859053c458688044d816117D5Bdf42A56813",
  celo: "0x0F548d7AD1A0CB30D1872b8C18894484d76e1569",
  algebra_polygon: "0xAeC731F69Fa39aD84c7749E913e3bC227427Adfd",
};

const blacklist = {
  polygon: ["0xa9782a2c9c3fb83937f14cdfac9a6d23946c9255"],
};

const liquidityMiningQuery = gql`
  {
    hypervisors(first: 10) {
      id
      stakingToken {
        id
        symbol
      }
      totalStakedAmount
    }
  }
`;

const uniV3HypervisorQuery = gql`
  {
    uniswapV3Hypervisors(first: 1000) {
      id
    }
  }
`;

/*Tokens staked in Visors*/
async function tvlLiquidityMining(timestamp, block, _, { api }) {
  const balances = {};

  //get the staking pool contracts, and the respective token addresses
  const resp = await request(GRAPH_URL["ethereum"], liquidityMiningQuery);
  const bals = await api.multiCall({ abi: hypervisorAbi.getHyperVisorData, calls: resp.hypervisors.map(i => i.id) })
  bals.forEach(({ totalStake }, i) => sdk.util.sumSingleBalance(balances, resp.hypervisors[i].stakingToken.id, totalStake, api.chain))
  return balances
}

/*Tokens deposited in Uniswap V3 positions managed by Visor*/
async function tvlUniV3(api) {
  const resp = await request(GRAPH_URL[api.chain], uniV3HypervisorQuery);
  return getHypervisorBalances({ api, hypervisors: resp.uniswapV3Hypervisors.map(i => i.id) })
}

async function tvlUniV3_onchain(api, key) {

  const target = HYPE_REGISTRY[key]
  let hypervisors = await api.fetchList({ lengthAbi: hypeRegistry.counter, itemAbi: hypeRegistry.hypeByIndex, target })
  // Valid hypervisors have hypeIndex > 0
  hypervisors = hypervisors.filter(hypervisor => hypervisor[1] > 0).map(i => i[0])

  return getHypervisorBalances({ hypervisors, api, })
}

async function tvlWrapper(_, _b, _cb, { api, }) {
  return tvlUniV3(api)
}

function tvlOnchain(key) {
  return async (_, _1, _2, { api }) => tvlUniV3_onchain(api, key)
}

async function getHypervisorBalances({ hypervisors, api, balances = {} }) {
  hypervisors = getUniqueAddresses(hypervisors)
  if (blacklist[api.chain]) {
    const blacklistSet = new Set(blacklist[api.chain].map(i => i.toLowerCase()))
    hypervisors = hypervisors.filter(i => !blacklistSet.has(i.toLowerCase()))
  }
  const supplies = await api.multiCall({ abi: 'erc20:totalSupply', calls: hypervisors })
  hypervisors = hypervisors.filter((_, i) => +supplies[i] > 0)

  const [token0s, token1s, bals] = await Promise.all([
    api.multiCall({ calls: hypervisors, abi: 'address:token0' }),
    api.multiCall({ calls: hypervisors, abi: 'address:token1' }),
    api.multiCall({ calls: hypervisors, abi: getTotalAmounts }),
  ])
  bals.forEach(({ total0, total1, }, i) => {
    sdk.util.sumSingleBalance(balances, token0s[i], total0, api.chain)
    sdk.util.sumSingleBalance(balances, token1s[i], total1, api.chain)
  })
  return balances
}

module.exports = {
  doublecounted: true,
  start: 1616679762, // (Mar-25-2021 01:42:42 PM +UTC)
  ethereum: {
    tvl: sdk.util.sumChainTvls([
      tvlLiquidityMining,
      tvlWrapper,
    ]),
    staking: staking(
      "0x26805021988f1a45dc708b5fb75fc75f21747d8c",
      "0x6bea7cfef803d1e3d5f7c0103f7ded065644e197",
      "ethereum"
    ),
  },
  polygon: {
    tvl: sdk.util.sumChainTvls([
      tvlOnchain('algebra_polygon'),
      tvlOnchain('polygon'),
    ]),
  },
  optimism: {
    tvl: tvlWrapper,
  },
  arbitrum: {
    tvl: tvlWrapper,
  },
  celo: {
    tvl: tvlWrapper,
  },
};
