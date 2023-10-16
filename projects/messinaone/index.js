const { getConfig } = require("../helper/cache");
const { sumTokens } = require("../helper/sumTokens");

let messinaAssets;

const tokenChain = {
  ethereum: 2,
  algorand: 8,
  cronos: 20025,
  polygon: 5,
  avax: 6,
  arbitrum: 23,
  bsc: 4,
};

const fetchAssets = async () => {
  if (!messinaAssets)
    messinaAssets = getConfig(
      "messina-one",
      "https://messina.one/api/bridge/get-assets?cache=true"
    );

  return messinaAssets;
};

const tvl = async (_, _1, _2, { chain }) => {
  messinaAssets = await fetchAssets();
  messinaAssets = messinaAssets.filter((asset) => asset.wrapped === false);
  const toa = messinaAssets
    .filter((t) => t.chainId == tokenChain[chain])
    .map((i) => [i.id, i.escrowAddress]);
  return sumTokens({ chain, tokensAndOwners: toa });
};

module.exports = {
  timetravel: false,
  methodology: "Fetches assets currently held by Messina.one contracts.",
  ethereum: { tvl },
  algorand: { tvl },
  cronos: { tvl },
  polygon: { tvl },
  avax: { tvl },
  arbitrum: { tvl },
  bsc: { tvl },
};
