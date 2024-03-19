const { sumTokens2 } = require("../helper/unwrapLPs");
const { fetchURL } = require("../helper/utils");

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

function tvl(chain, get) {
  return async (_t, _e, { [chain]: block }) => {
    const assets = (await get).data;
    const tokensAndOwners = assets.map((data) => [
      data[chainKeys[chain].asset],
      data[`${chainKeys[chain].chain}BridgeAddress`],
    ]);
    return sumTokens2({ tokensAndOwners, block, chain });
  };
}

const chainTypeExports = () => {
  const get = fetchURL("https://api.hotcross.com/bridges");
  return Object.keys(chainKeys).reduce(
    (obj, chain) => ({ ...obj, [chain]: { tvl: tvl(chain, get) } }),
    {}
  );
};

module.exports = chainTypeExports();
