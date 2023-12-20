const ADDRESSES = require("../helper/coreAssets.json");
const { chainExports } = require("../helper/exports");
const { sumTokens2 } = require("../helper/unwrapLPs");
const sdk = require("@defillama/sdk");
const { fetchURL } = require("../helper/utils");

const chainMappings = {
  eth: "ethereum",
  bsc: "bsc",
  polygon: "polygon",
};
const chainIds = {
  ethereum: 1,
  bsc: 56,
  polygon: 137,
};

function chainTvl(chain) {
  return async function tvl(_, _b, _cb, { api }) {
    const { data } = await fetchURL(
      "https://api.multibit.exchange/support/token"
    );
    const [config] = data.filter((v) => chain === chainMappings[v.chain]);

    if (!config) return {};

    const balances = {};
    const transform = (v) => {
      return `${chain}:${v}`;
    };
    const { real, wrap } = config;
    // balanceof
    const tokenA = Object.values(real.data);
    const resultA = await sdk.api.abi.multiCall({
      abi: "erc20:balanceOf",
      chain,
      calls: tokenA.map((target) => ({
        target,
        params: real.contract,
      })),
    });
    sdk.util.sumMultiBalanceOf(balances, resultA, true, transform);

    // totalSupply
    const tokenB = Object.values(wrap.data);
    const resultB = await sdk.api.abi.multiCall({
      abi: "uint256:totalSupply",
      chain,
      calls: tokenB.map((target) => ({ target })),
    });

    sdk.util.sumMultiBalanceOf(balances, resultB, true, transform);

    return balances;

  };
}

module.exports = chainExports(chainTvl, Object.keys(chainIds));
module.exports.methodology = `Tokens bridged via MultiBit are counted as TVL`;
module.exports.misrepresentedTokens = true;
module.exports.hallmarks = [[1651881600, "UST depeg"]];
