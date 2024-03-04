const { sumTokens2 } = require("../helper/unwrapLPs");
const { getConfig } = require("../helper/cache");

const chainKeys = {
  ethereum: {
    asset: "erc20",
    chain: "eth",
  },
  bsc: {
    asset: "bep20",
    chain: "bsc",
  },
};

function tvl(chain) {
  return async (_t, _e, { [chain]: block }) => {
    const assets = await getConfig('hotcross', "https://api.hotcross.com/bridges");
    const tokensAndOwners = assets.map((data) => [
      data[chainKeys[chain].asset],
      data[`${chainKeys[chain].chain}BridgeAddress`],
    ]);
    return sumTokens2({ tokensAndOwners, block, chain });
  };
}

const chainTypeExports = () => {
  return Object.keys(chainKeys).reduce(
    (obj, chain) => ({ ...obj, [chain]: { tvl: tvl(chain) } }),
    {}
  );
};

module.exports = chainTypeExports();
