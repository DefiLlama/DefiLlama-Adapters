const abi = require("./abi");
const { getChainTransform } = require("../helper/portedTokens");
const { sumTokens } = require("../helper/unwrapLPs");
const sdk = require("@defillama/sdk");

const config = {
  cronos: {
    factories: ["0xb8b48e97cd037987de138b978df265d873333a3b"],
  },
};

module.exports = {}


Object.keys(config).forEach((chain) => {
  let promise;
  const balances = {};
  const borrowedBalances = {};

  const _getTvl = async (block) => {
    const { factories } = config[chain];
    //console.log(config[chain]);
    const transform = await getChainTransform(chain);

    const collaterals = [];
    const borrowables = [];
    for (const factory of factories) {
      const { output: allLendingPoolsLength } = await sdk.api.abi.call({
        target: factory,
        abi: abi.allLendingPoolsLength,
        chain,
        block,
      });

      const poolCalls = [];
      for (let i = 0; i < +allLendingPoolsLength; i++) {
        poolCalls.push({ params: i });
      }

      const { output: allLendingPools } = await sdk.api.abi.multiCall({
        target: factory,
        abi: abi.allLendingPools,
        calls: poolCalls,
        chain,
        block,
      });

      const callz = allLendingPools.map((i) => ({ params: i.output }));

      const { output: getLendingPool } = await sdk.api.abi.multiCall({
        target: factory,
        abi: abi.getLendingPool,
        calls: callz,
        chain,
        block,
      });

      getLendingPool.forEach((lp) => {
        collaterals.push(lp.output.collateral);
        borrowables.push(lp.output.borrowable0, lp.output.borrowable1);
      });
    }

    const underlyingCalls = [...collaterals, ...borrowables].map((i) => ({
      target: i,
    }));

    const { output: toaInput } = await sdk.api.abi.multiCall({
      abi: abi.underlying,
      calls: underlyingCalls,
      chain,
      block,
    });

    //console.log(toaInput)

    const underlyingMapping = {};

    const toa = toaInput.map((i) => [i.output, i.input.target]);
    toaInput.forEach((t) => (underlyingMapping[t.input.target] = t.output));
    //console.log(underlyingMapping)
    const { output: borrowed } = await sdk.api.abi.multiCall({
      abi: abi.totalBorrows,
      calls: borrowables.map((i) => ({ target: i })),
      chain,
      block,
    });

    borrowed.forEach((b) => {
      sdk.util.sumSingleBalance(
        borrowedBalances,
        transform(underlyingMapping[b.input.target]),
        b.output
      );
    });
    await sumTokens(balances, toa, block, chain, transform, {
      resolveLP: true,
      blacklistedLPs: ["0xa5c76fe460128936229f80f651b1deafa37583ae"]
    });
    return { balances, borrowedBalances };
  };

  const getTvl = async (block) => {
    if (!promise) promise = _getTvl(block);
    return promise;
  };

  module.exports[chain] = {
    tvl: async (_, _b, { [chain]: block }) => (await getTvl(block)).balances,
    borrowed: async (_, _b, { [chain]: block }) => (await getTvl(block)).borrowedBalances,
  };
});

