const { get } = require("../helper/http");
const { fixBalancesTokens } = require("../helper/tokenMapping");

let messinaAssets = [];

const tokenChain = {
  ethereum: 2,
  algorand: 8,
};

const fetchAssets = async () => {
  if (!messinaAssets.length) {
    messinaAssets = await get(
      "https://messina.one/api/bridge/get-assets?cache=true"
    );
  }

  return messinaAssets;
};

const processTvl = async (chain) => {
  let balances = {};

  messinaAssets = await fetchAssets();

  const filteredTvls = messinaAssets.filter((t) => t.chainId == chain);

  filteredTvls.forEach((f) => {
    const { id, tvl, sourceDecimals } = f;

    if (chain == tokenChain.ethereum) {
      balances[id] = tvl;
    } else {
      // get coingeckoId
      const { coingeckoId } = fixBalancesTokens.algorand[id];

      balances[coingeckoId] = tvl * 0.1 ** sourceDecimals;
    }
  });

  return balances;
};

const tvlAlgo = async () => await processTvl(tokenChain.algorand);

const tvlEth = async () => await processTvl(tokenChain.ethereum);

module.exports = {
  methodology: "Fetches assets currently held by Messina.one contracts.",
  ethereum: { tvl: tvlEth },
  algorand: { tvl: tvlAlgo },
};
