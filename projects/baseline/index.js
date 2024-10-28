const BASELINE_CONTRACT = "0x14eB8d9b6e19842B5930030B18c50B0391561f27";
const BASELINE_CONTRACT_V2 = "0x1a49351bdB4BE48C0009b661765D01ed58E8C2d8";
const CREDT_CONTRACT = "0x158d9270F7931d0eB48Efd72E62c0E9fFfE0E67b";

async function tvl(api) {
  //floor, anchor, discovery
  const positions = [0, 1, 2];

  //return position info from baseline contract
  const position = await api.multiCall({ target: BASELINE_CONTRACT, calls: positions, abi: abi.getPosition, });
  //return managed positions from baseline contract
  const baselinePositionBalances = await api.multiCall({ target: BASELINE_CONTRACT, calls: position.map(i => ({ params: [i], })), abi: abi.getBalancesForPosition, });
  //sum the reserve balances
  api.addGasToken(baselinePositionBalances.map(i => i.reserves));

  //baseline V2 Positions
  const v2Positions = await api.multiCall({ target: BASELINE_CONTRACT_V2, calls: positions, abi: v2Abi.getPosition });
  //account for collateral now locked in protocol from borrowing activity

  api.addGasToken(v2Positions.map(i => i.reserves));
}

async function borrowed(api) {
  const lentReserves = await api.call({ abi: abi.totalLentReserves, target: BASELINE_CONTRACT, });
  const lentReservesV2 = await api.call({ abi: credtAbi.totalCreditIssues, target: CREDT_CONTRACT });
  api.addGasToken(lentReserves)
  api.addGasToken(lentReservesV2)
}

async function staking(api) {
  const v2CollateralLocked = await api.call({ target: CREDT_CONTRACT, abi: credtAbi.totalCollateralized });
  api.add(BASELINE_CONTRACT_V2, v2CollateralLocked);  // collateral deposited into protocol by EOA in exchange for a loan
}

module.exports = {
  hallmarks: [
    [1714251306, "self-whitehack"]
  ],
  doublecounted: true,
  blast: {
    tvl,
    borrowed,
    staking,
  },
};

const abi = {
  totalLentReserves: "function totalLentReserves() view returns (uint256)",
  getPosition:
    "function getPosition(uint8) view returns (tuple(uint8, int24, int24))",
  getBalancesForPosition:
    "function getBalancesForPosition(tuple(uint8,int24,int24)) view returns (uint256 reserves, uint256 bAsset)",
};

const v2Abi = {
  getPosition: "function getPosition(uint8) view returns (tuple(uint128 liquidity, uint160 sqrtPriceL, uint160 sqrtPriceU, uint256 bAssets, uint256 reserves, uint256 capacity))",
}

const credtAbi = {
  totalCreditIssues: "function totalCreditIssued() view returns (uint256)",
  totalCollateralized: "function totalCollateralized() view returns (uint256)",
}
