const BASELINE_CONTRACT = "0x14eB8d9b6e19842B5930030B18c50B0391561f27";

async function tvl(api) {
  //floor, anchor, discovery
  const positions = [0, 1, 2];

  //return position info from baseline contract
  const position = await api.multiCall({ target: BASELINE_CONTRACT, calls: positions, abi: abi.getPosition, });
  //return managed positions from baseline contract
  const baselinePositionBalances = await api.multiCall({ target: BASELINE_CONTRACT, calls: position.map(i => ({ params: [i], })), abi: abi.getBalancesForPosition, });
  //sum the reserve balances
  api.addGasToken(baselinePositionBalances.map(i => i.reserves))
}

async function borrowed(api) {
  const lentReserves = await api.call({ abi: abi.totalLentReserves, target: BASELINE_CONTRACT, });
  api.addGasToken(lentReserves)
}

module.exports = {
  hallmarks: [
    [1714251306,"self-whitehack"]
  ],
  doublecounted: true,
  blast: {
    tvl,
    borrowed,
  },
};

const abi = {
  totalLentReserves: "function totalLentReserves() view returns (uint256)",
  getPosition:
    "function getPosition(uint8) view returns (tuple(uint8, int24, int24))",
  getBalancesForPosition:
    "function getBalancesForPosition(tuple(uint8,int24,int24)) view returns (uint256 reserves, uint256 bAsset)",
};
