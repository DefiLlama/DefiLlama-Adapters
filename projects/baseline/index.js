const ADDRESSES = require("../helper/coreAssets.json");

const sdk = require("@defillama/sdk");
const BASELINE_CONTRACT = "0x14eB8d9b6e19842B5930030B18c50B0391561f27";

async function tvl(_, _1, _2, { api }) {
  const bAsset = await api.call({
    abi: abi.bAsset,
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
  const baselinePositionBalances = await api.multiCall({
    calls: position.map((p) => ({
      target: BASELINE_CONTRACT,
      params: [p],
    })),
    abi: abi.getBalancesForPosition,
  });

  const reserves = baselinePositionBalances.map((b) => ({ reserves: b[0] }));

  const balances = {};

  //sum the reserve balances
  reserves.map((r) => {
    sdk.util.sumSingleBalance(
      balances,
      ADDRESSES.blast.WETH,
      r.reserves,
      "blast"
    );
  });

  return balances;
}

async function borrowed(_, _1, _2, { api }) {
  const balances = {};
  const lentReserves = await api.call({
    abi: abi.totalLentReserves,
    target: BASELINE_CONTRACT,
  });
  sdk.util.sumSingleBalance(
    balances,
    ADDRESSES.blast.WETH,
    lentReserves,
    "blast"
  );
  return balances;
}

module.exports = {
  doublecounted: true,
  blast: {
    tvl,
    borrowed,
  },
};

const abi = {
  bAsset: "function bAsset() view returns (address)",
  totalLentReserves: "function totalLentReserves() view returns (uint256)",
  getPosition:
    "function getPosition(uint8) view returns (tuple(uint8, int24, int24))",
  getBalancesForPosition:
    "function getBalancesForPosition(tuple(uint8,int24,int24)) view returns (uint256 reserves, uint256 bAsset)",
};
