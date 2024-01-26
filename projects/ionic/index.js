const sdk = require("@defillama/sdk");

const { compoundExportsWithAsyncTransform } = require("../helper/compound");

const pools = {
  mode: {
    pools: ["0xfb3323e24743caf4add0fdccfb268565c0685556"],
  },
};

function getTvl(chain) {
  const config = pools[chain] ?? { pools: [] };
  const tvls = config.pools.map((pool) =>
    compoundExportsWithAsyncTransform(pool, chain, undefined, undefined, {
      resolveLPs: true,
    })
  );
  let _tvl = sdk.util.sumChainTvls(tvls.map((t) => t.tvl));
  let _borrowed = sdk.util.sumChainTvls(tvls.map((t) => t.borrowed));
  let tvl = _tvl;
  let borrowed = _borrowed;
  return { tvl, borrowed };
}

Object.keys(pools).forEach((chain) => (module.exports[chain] = getTvl(chain)));
