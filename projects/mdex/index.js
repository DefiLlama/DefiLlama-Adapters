const { request, gql } = require("graphql-request");
const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");

// --- Similar abi's required = pancake script, similar logic! ---
const abi = require("./abi.json");
const token0 = require("../helper/abis/token0.json");
const token1 = require("../helper/abis/token1.json");
const getReserves = require("../helper/abis/getReserves.json");

// --> bsc addresses found here:    https://github.com/mdexSwap/bscswap
// --> heco addresses found here:   https://github.com/mdexSwap/contracts

const factories = {
  heco: "0xb0b670fc1F7724119963018DB0BfA86aDb22d941",
  bsc: "0x3CD1C46068dAEa5Ebb0d3f55F6915B10648062B8",
};

const REDUCE_BLOCK = 60;

const graphUrls = {
  heco: "https://heco-lite-graph.mdex.cc/subgraphs/name/chain/heco",
  bsc: "https://bsc-graph.mdex.com/subgraphs/name/chains/bsc",
};

const graphQueries = {
  heco: gql`
    query tvl($block: Int) {
      mdexFactory(
        id: "0xb0b670fc1F7724119963018DB0BfA86aDb22d941"
        block: { number: $block }
      ) {
        totalLiquidityUSD
      }
    }
  `,
  bsc: gql`
    query tvl($block: Int) {
      mdexFactory(
        id: "0x3CD1C46068dAEa5Ebb0d3f55F6915B10648062B8"
        block: { number: $block }
      ) {
        totalLiquidityUSD
      }
    }
  `,
};

// --- We need to token as ref for the balances object ---
const usdtToken = "0xdac17f958d2ee523a2206206994597c13d831ec7";

function getMDEXLiquidity(block, chain) {
  return request(graphUrls[chain], graphQueries[chain], {
    block,
  }).then((data) => data);
}

async function processPairs(
  balances,
  pairNums,
  chain,
  block,
  factory,
  preAdressSignaling
) {
  const pairs = (
    await sdk.api.abi.multiCall({
      abi: abi.allPairs,
      chain: `${preAdressSignaling}`,
      calls: pairNums.map((num) => ({
        target: factory,
        params: [num],
      })),
    })
  ).output;

  // --- In case pairs returns empty array, does not make sense to move down (avoid errs output) ---
  if (pairs.length == 0) return;

  // --- In case that output is null will not make sense to move further (avoid errs output) ---
  if (pairs[0].output == null) return;

  const pairAddresses = pairs.map((result) => result.output.toLowerCase());
  const [token0Addresses, token1Addresses, reserves] = await Promise.all([
    sdk.api.abi
      .multiCall({
        abi: token0,
        chain,
        calls: pairAddresses.map((pairAddress) => ({
          target: pairAddress,
        })),
        block,
      })
      .then(({ output }) => output),
    sdk.api.abi
      .multiCall({
        abi: token1,
        chain,
        calls: pairAddresses.map((pairAddress) => ({
          target: pairAddress,
        })),
        block,
      })
      .then(({ output }) => output),
    sdk.api.abi
      .multiCall({
        abi: getReserves,
        chain,
        calls: pairAddresses.map((pairAddress) => ({
          target: pairAddress,
        })),
        block,
      })
      .then(({ output }) => output),
  ]);

  for (let n = 0; n < pairNums.length; n++) {
    // --- Added try/catch block for both outputs from reserve and check null vals before ---
    try {
      if (reserves[n] != null) {
        sdk.util.sumSingleBalance(
          balances,
          `${preAdressSignaling}:${token1Addresses[n].output}`,
          reserves[n].output[1]
        );
      }
    } catch (err) {
      console.error(err);
    }

    try {
      if (reserves[n] != null) {
        sdk.util.sumSingleBalance(
          balances,
          `${preAdressSignaling}:${token0Addresses[n].output}`,
          reserves[n].output[0]
        );
      }
    } catch (err) {
      console.error(err);
    }
  }
}

const bscTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};
  const pairLength = Number(
    (
      await sdk.api.abi.call({
        target: factories["bsc"],
        abi: abi.allPairsLength,
        chain: "bsc",
        block: chainBlocks["bsc"],
      })
    ).output
  );

  // 0 to pairLength - 1
  const allPairNums = Array.from(Array(pairLength).keys());
  const reqs = [];

  for (let i = 0; i < pairLength; i++) {
    const pairNums = allPairNums.slice(i, i + 1);

    const output = processPairs(
      balances,
      pairNums,
      "bsc",
      chainBlocks["bsc"],
      factories["bsc"],
      "bsc"
    );

    if (output != undefined) {
      reqs.push(output);
    }
  }

  await Promise.all(reqs);

  return balances;
};

const hecoTvl = async (timestamp, ethBlock, chainBlocks) => {
  let block = chainBlocks["heco"];

  if (block === undefined) {
    block = (await sdk.api.util.lookupBlock(timestamp, { chain: "heco" }))
      .block;
  }

  // --- Reduce a bit as the indexing takes time to catch up, otherwise error jumps somehow from endpoint ---
  const results = await getMDEXLiquidity(block - REDUCE_BLOCK, "heco");

  return {
    // --- Arrange to account the decimals as it was usdt (decimals = 6) ---
    [usdtToken]: BigNumber(results.mdexFactory.totalLiquidityUSD)
      .multipliedBy(10 ** 6)
      .toFixed(0),
  };
};

module.exports = {
  bsc: {
    tvl: bscTvl, //   individually outputs >1B    ---   breakdown per token             (OK)
  },
  heco: {
    tvl: hecoTvl, //  individually outputs >1B    ---   simply using graphql endpoint   (OK)
  },
  tvl: sdk.util.sumChainTvls([hecoTvl, bscTvl]),
};
