const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { fetchURL } = require("../helper/utils");
const { chainExports } = require("../helper/exports");

const BRIDGE_TOKENS = "https://api.multibit.exchange/support/token";
const chains = {
  ethereum: {
    staking: {
      // https://app.multibit.exchange/staking
      pool: "0x2EDfFbc62C3dfFD2a8FbAE3cd83A986B5bbB5495",
    },
    tvl: true,
  },
  bsc: {
    staking: false,
    tvl: true,
  },
  polygon: {
    staking: false,
    tvl: true,
  },
  // TODO: BRC20 assets are not supported.
  bitcoin: {
    staking: false,
    tvl: false,
  },
};

const chainMappings = {
  eth: "ethereum",
  bsc: "bsc",
  polygon: "polygon",
};

const getTvlAndStaking = (chain) => {
  const transform = (v) => `${chain}:${v}`;

  const getTvl = async (timestamp, block) => {
    const balances = {};

    if (!chains[chain].tvl) {
      return balances;
    }
    const { data } = await fetchURL(BRIDGE_TOKENS);
    const [config] = data.filter((v) => chain === chainMappings[v.chain]);
    if (!config) return {};
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

  const getStaking = async (timestamp, block, _, { api }) => {
    const balances = {};

    if (!chains[chain].staking) {
      return balances;
    }

    const poolContract = chains[chain].staking.pool;

    const { output: poolCount } = await sdk.api.abi.call({
      block,
      chain,
      target: poolContract,
      abi: abi.poolLength,
    });

    const { output: pools } = await sdk.api.abi.multiCall({
      chain,
      abi: abi.pools,
      calls: new Array(Number(poolCount)).fill().map((v, i) => ({
        target: poolContract,
        params: i,
      })),
    });

    pools.forEach((v) => {
      const stakeToken = v.output[0];
      const totalStakedAmount = v.output[8];
      sdk.util.sumSingleBalance(
        balances,
        transform(stakeToken),
        totalStakedAmount
      );
    });

    return balances;
  };

  return {
    tvl: getTvl,
    staking: getStaking,
  };
};

module.exports = Object.keys(chains).reduce((prev, chain) => {
  const config = getTvlAndStaking(chain);
  return {
    ...prev,
    [chain]: config,
  };
}, {});

module.exports.methodology = `Tokens bridged via MultiBit are counted as TVL`;
module.exports.misrepresentedTokens = true;
module.exports.hallmarks = [[1651881600, "UST depeg"]];
