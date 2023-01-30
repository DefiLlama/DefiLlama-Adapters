const sdk = require("@defillama/sdk");
const hypervisorAbi = require("./abis/hypervisor.json");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { staking } = require("../helper/staking");
const { getChainTransform } = require("../helper/portedTokens");
const { request, gql } = require("graphql-request");

const getTotalAmounts = require("./abis/getTotalAmounts.json");
const hypeRegistry = require("./abis/hypeRegistry.json");
const tokens = require("./abis/tokens.json");

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

const HYPERVISORS_RO = {
  ethereum: ["0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599"],
  polygon: ["0xa9782a2c9c3fb83937f14cdfac9a6d23946c9255"],
  optimism: [],
  arbitrum: [],
  celo: [],
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

const mergeDicts = (data1, data2) => {
  const result = {};

  Object.entries(data1).forEach(([key, value]) => {
    if (result[key]) {
      result[key] = (Number(result[key]) + Number(value)).toString();
    } else {
      result[key] = value;
    }
  });
  Object.entries(data2).forEach(([key, value]) => {
    if (result[key]) {
      result[key] = (Number(result[key]) + Number(value)).toString();
    } else {
      result[key] = value;
    }
  });
  return result;
};

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
  let quickswap = await tvlUniV3_onchain(timestamp, chainBlocks, "algebra_polygon");
  let uniswap = await tvlUniV3_onchain(timestamp, chainBlocks, "polygon");
  return mergeDicts(quickswap, uniswap);
}

async function tvlOptimism(timestamp, block, chainBlocks) {
  return await tvlUniV3(timestamp, chainBlocks, "optimism");
}

async function tvlArbitrum(timestamp, block, chainBlocks) {
  return await tvlUniV3(timestamp, chainBlocks, "arbitrum");
}

async function tvlCelo(timestamp, block, chainBlocks) {
  return await tvlUniV3(timestamp, chainBlocks, "celo");
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

  if (chain.includes("_")) {
    chain = chain.split("_")[1];
  }

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

async function tvlUniV3_onchain(timestamp, chainBlocks, chain) {
  const balances = {};

  const target = HYPE_REGISTRY[chain]

  if (chain.includes("_")) {
    chain = chain.split("_")[1];
  }

  const totalHypervisors_count = await sdk.api.abi.call({
    chain: chain,
    target: target,
    abi: hypeRegistry.counter,
    block: chainBlocks[chain],
  });

  const hypervisorAddresses = [];
  const token0Addresses = [];
  const token1Addresses = [];

  for (let i = 0; i < totalHypervisors_count.output; i++) {
    // get hypervisor address
    let hype_id = await sdk.api.abi.call({
      chain: chain,
      target: target,
      abi: hypeRegistry.hypeByIndex,
      params: i,
      block: chainBlocks[chain],
    });
    if (HYPERVISORS_RO[chain].includes(hype_id.output[0].toLowerCase())) {
      // loop
      continue
    }
    hypervisorAddresses.push(hype_id.output[0].toLowerCase());

    let token0Address = await sdk.api.abi.call({
      chain: chain,
      target: hype_id.output[0].toLowerCase(),
      abi: tokens["token0"],
      block: chainBlocks[chain],
    });
    token0Addresses.push(token0Address.output.toLowerCase());

    let token1Address = await sdk.api.abi.call({
      chain: chain,
      target: hype_id.output[0].toLowerCase(),
      abi: tokens["token1"],
      block: chainBlocks[chain],
    });
    token1Addresses.push(token1Address.output.toLowerCase());

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
  },
  arbitrum: {
    tvl: tvlArbitrum,
  },
  celo: {
    tvl: tvlCelo,
  },
};
