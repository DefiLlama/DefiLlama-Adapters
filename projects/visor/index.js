const sdk = require("@defillama/sdk");
const hypervisorAbi = require("./abis/hypervisor.json");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { staking } = require("../helper/staking");
const { getChainTransform } = require("../helper/portedTokens");
const { request, gql } = require("graphql-request");

const getTotalAmounts = require("./abis/getTotalAmounts.json");

//get their pool addresses from the subgraph
const GRAPH_URL = {
  ethereum: "https://api.thegraph.com/subgraphs/name/gammastrategies/gamma",
  polygon: "https://api.thegraph.com/subgraphs/name/gammastrategies/polygon",
  optimism: "https://api.thegraph.com/subgraphs/name/gammastrategies/optimism"
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
      pool {
        token0 {
          id
        }
        token1 {
          id
        }
      }
    }
  }
`;

async function tvlEthereum(timestamp, block, chainBlocks) {
  const balances = {};

  const tvls = await Promise.all([
    tvlLiquidityMining(timestamp, block),
    tvlUniV3(timestamp, chainBlocks, "ethereum"),
  ]);

  // Ethereum TVL
  for (const currTvl of tvls) {
    for (let [token, amount] of Object.entries(currTvl)) {
      sdk.util.sumSingleBalance(balances, token, amount);
    }
  }

  return balances;
}

async function tvlPolygon(timestamp, block, chainBlocks) {
  return await tvlUniV3(timestamp, chainBlocks, "polygon");
}

async function tvlOptimism(timestamp, block, chainBlocks) {
  return await tvlUniV3(timestamp, chainBlocks, "optimism");
}

/*Tokens staked in Visors*/
async function tvlLiquidityMining(timestamp, block) {
  const balances = {};

  //get the staking pool contracts, and the respective token addresses
  const resp = await request(GRAPH_URL["ethereum"], liquidityMiningQuery);

  for (let i = 0; i < resp.hypervisors.length; i++) {
    const curr = resp.hypervisors[i];
    const stakingPoolAddr = curr.id;
    const tokenAddr = curr.stakingToken.id;

    const tokenLocked = await sdk.api.abi.call({
      target: stakingPoolAddr,
      abi: hypervisorAbi["getHyperVisorData"],
      block: block,
    });

    if (curr.stakingToken.symbol == "UNI-V2") {
      await unwrapUniswapLPs(
        balances,
        [
          {
            token: tokenAddr,
            balance: tokenLocked.output.totalStake,
          },
        ],
        block
      );
    } else {
      balances[tokenAddr] = tokenLocked.output.totalStake;
    }
  }

  return balances;
}

/*Tokens deposited in Uniswap V3 positions managed by Visor*/
async function tvlUniV3(timestamp, chainBlocks, chain) {
  const balances = {};

  const resp = await request(GRAPH_URL[chain], uniV3HypervisorQuery);

  const hypervisorAddresses = [];
  const token0Addresses = [];
  const token1Addresses = [];

  for (let hypervisor of resp.uniswapV3Hypervisors) {
    token0Addresses.push(hypervisor.pool.token0.id.toLowerCase());
    token1Addresses.push(hypervisor.pool.token1.id.toLowerCase());
    hypervisorAddresses.push(hypervisor.id.toLowerCase());
  }

  const hypervisors = {};
  // add token0Addresses
  token0Addresses.forEach((token0Address, i) => {
    const hypervisorAddress = hypervisorAddresses[i];
    hypervisors[hypervisorAddress] = {
      token0Address: token0Address,
    };
  });

  // add token1Addresses
  token1Addresses.forEach((token1Address, i) => {
    const hypervisorAddress = hypervisorAddresses[i];
    hypervisors[hypervisorAddress] = {
      ...(hypervisors[hypervisorAddress] || {}),
      token1Address: token1Address,
    };
  });

  let hypervisorCalls = [];

  for (let hypervisor of Object.keys(hypervisors)) {
    hypervisorCalls.push({
      target: hypervisor,
    });
  }

  // Call getTotalAmounts on hypervisor contract
  const hypervisorBalances = await sdk.api.abi.multiCall({
    chain: chain,
    abi: getTotalAmounts,
    calls: hypervisorCalls,
    block: chainBlocks[chain],
  });

  const chainTransform = await getChainTransform(chain);

  // Sum up balance0 and balance1 for each hypervisor
  for (let balance of hypervisorBalances.output) {
    let hypervisorAddress = balance.input.target;
    let address0 = hypervisors[hypervisorAddress].token0Address;
    let address1 = hypervisors[hypervisorAddress].token1Address;
    let balance0 = balance.output.total0;
    let balance1 = balance.output.total1;

    sdk.util.sumSingleBalance(balances, chainTransform(address0), balance0);
    sdk.util.sumSingleBalance(balances, chainTransform(address1), balance1);
  }

  return balances;
}

module.exports = {
  start: 1616679762, // (Mar-25-2021 01:42:42 PM +UTC)
  ethereum: {
    tvl: tvlEthereum,
    staking: staking(
      "0x26805021988f1a45dc708b5fb75fc75f21747d8c",
      "0x6bea7cfef803d1e3d5f7c0103f7ded065644e197",
      "ethereum"
    ),
  },
  polygon: {
    tvl: tvlPolygon,
  },
  optimism: {
    tvl: tvlOptimism,
  }
};
