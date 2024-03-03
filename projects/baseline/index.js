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

  //floor, anchor, discovery
  const positions = [0, 1, 2];

  //return position info from baseline contract
  const position = await api.multiCall({
    calls: positions.map((p) => ({
      target: BASELINE_CONTRACT,
      params: [p],
    })),
    abi: abi.getPosition,
  });

  //return managed positions from baseline contract
  const balances = await api.multiCall({
    calls: position.map((p) => ({
      target: BASELINE_CONTRACT,
      params: [p],
    })),
    abi: abi.getBalancesForPosition,
  });

  const reserves = balances.map((b) => ({ reserves: b[0] }));

  const data = await api.sumTokens({
    tokensAndOwners: [[bAsset, BASELINE_CONTRACT]],
  });

  //sum the reserve balances
  const reserveBalances = reserves.map((r) => {
    sdk.util.sumSingleBalance(data, ADDRESSES.blast.WETH, r.reserves, "blast");
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
  getPosition:
    "function getPosition(uint8) view returns (tuple(uint8, int24, int24))",
  getBalancesForPosition:
    "function getBalancesForPosition(tuple(uint8,int24,int24)) view returns (uint256 reserves, uint256 bAsset)",
};
