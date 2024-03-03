const ADDRESSES = require("../helper/coreAssets.json");

const sdk = require("@defillama/sdk");

async function tvl(_, _1, _2, { api }) {
  const BASELINE_CONTRACT = "0x14eB8d9b6e19842B5930030B18c50B0391561f27";

  const bAsset = await api.call({
    abi: abi.bAsset,
    target: BASELINE_CONTRACT,
  });

  const pool = await api.call({
    abi: abi.pool,
    target: BASELINE_CONTRACT,
  });

  return await api.sumTokens({
    tokensAndOwners: [
      [bAsset, BASELINE_CONTRACT],
      [ADDRESSES.blast.WETH, pool],
    ],
  });
}

module.exports = {
  blast: {
    tvl: tvl,
  },
};

const abi = {
  pool: "function pool() view returns (address)",
  bAsset: "function bAsset() view returns (address)",
};
