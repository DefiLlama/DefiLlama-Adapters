const sdk = require("@defillama/sdk");
const { sumTokens, } = require("../helper/unwrapLPs");
const { getChainTransform } = require("../helper/portedTokens");
const abi = require("./abi");
const { Chain, lsps, uniswapFactory, ZERO_ADDRESS, usdc } = require("./registry");

const makeUniswapReserves = (chain, makeAddressTransform) => {
  return async (timestamp, _, {[chain]: block}) => {
    const balances = {};
    const transform = await getChainTransform(chain);

    const getLongToken = abi["LongShortPair.longToken"];
    const getShortToken = abi["LongShortPair.shortToken"];

    const [longTokens, shortTokens] = await Promise.all([
      sdk.api.abi.multiCall({
        calls: lsps[chain].map(x => ({ target: x.address })),
        block,
        chain,
        abi: getLongToken,
        requery: true,
      }),

      sdk.api.abi.multiCall({
        calls: lsps[chain].map(x => ({ target: x.address })),
        block,
        chain,
        abi: getShortToken,
        requery: true,
      }),
    ]);

    const syntheticTokens = [
      ...longTokens.output.map(x => x.output),
      ...shortTokens.output.map(x => x.output),
    ];

    const getPair = abi["UniswapFactory.getPair"];
    const pairAddresses = await sdk.api.abi.multiCall({
      calls: syntheticTokens.map(syntheticAddress => ({ 
        target: uniswapFactory[chain],
        params: [
          usdc[chain], // NOTE: This is referenced below when summing tokens
          syntheticAddress,
        ]
      })),
      block,
      chain,
      abi: getPair,
      requery: true,
    });

    for (const result of pairAddresses.output) {
      if (result.output === ZERO_ADDRESS) {
        throw new Error(`Failed to get Uniswap-like pair address on chain '${chain}' for pair [${result.input.params.join(", ")}]`);
      }
    }

    await sumTokens(
      balances,
      pairAddresses.output
        .filter((x) => x.output !== null)
        .map((x) => [
          /* target: */ x.input.params[0],
          /* owner:  */ x.output
        ]),
      block,
      chain,
      transform,
    );

    return balances;
  }
}

const makeLspTvl = (chain, makeAddressTransform) => {
  return async (timestamp, _, {[chain]: block}) => {
    const balances = {};
    const transform = await getChainTransform(chain);

    const getCollateralToken = abi["LongShortPair.collateralToken"];
    const collaterals = await sdk.api.abi.multiCall({
      calls: lsps[chain].map(x => ({ target: x.address })),
      block,
      chain,
      abi: getCollateralToken,
      requery: true,
    });
    
    await sumTokens(
      balances,
      collaterals.output
        .filter((x) => x.output !== null)
        .map((x) => [x.output, x.input.target]),
      block,
      chain,
      transform,
    );

    return balances;
  }
}

const run = (chain, f) => {
  return f(chain);
}

const runAll = (chain, fs) => {
  return fs.map(f => run(chain, f));
};

const tvlSources = [makeLspTvl, makeUniswapReserves];

module.exports = {
  ethereum: {
    tvl: sdk.util.sumChainTvls(runAll(Chain.ETHEREUM, tvlSources)),
  },
  polygon: {
    tvl: sdk.util.sumChainTvls(runAll(Chain.POLYGON, tvlSources)),
  },
  boba: {
    tvl: sdk.util.sumChainTvls(runAll(Chain.BOBA, tvlSources)),
  },
};
