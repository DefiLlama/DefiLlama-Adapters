const sdk = require("@defillama/sdk");
// --- ABI's required ---
const factoryAbi = require("./abis/factory.json");
const token0 = require("./abis/token0.json");
const token1 = require("./abis/token1.json");
const getReserves = require("./abis/getReserves.json");

async function processPairs(balances, pairNums, chain, block, factory) {
  const pairs = (
    await sdk.api.abi.multiCall({
      abi: factoryAbi.allPairs,
      chain,
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
          `${chain}:${token1Addresses[n].output}`,
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
          `${chain}:${token0Addresses[n].output}`,
          reserves[n].output[0]
        );
      }
    } catch (err) {
      console.error(err);
    }
  }
}

const tvlOnPairs = async (chain, chainBlocks, factoryTarget, balances) => {
  const pairLength = Number(
    (
      await sdk.api.abi.call({
        target: factoryTarget,
        abi: factoryAbi.allPairsLength,
        chain,
        block: chainBlocks[chain],
      })
    ).output
  );

  const allPairNums = Array.from(Array(pairLength).keys());
  const reqs = [];

  for (let i = 0; i < pairLength; i++) {
    const pairNums = allPairNums.slice(i, i + 1);

    const output = processPairs(
      balances,
      pairNums,
      chain,
      chainBlocks[chain],
      factoryTarget
    );

    if (output != undefined) {
      reqs.push(output);
    }
  }

  await Promise.all(reqs);
};

module.exports = tvlOnPairs;
