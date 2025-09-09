const { staking } = require("../helper/staking");

const StakingContract = "0x5C75A733656c3E42E44AFFf1aCa1913611F49230";
const TokenContract = "0x25356aeca4210eF7553140edb9b8026089E49396";

const DATA_PROVIDERS_CONTRACTS = [
  "0xaDB43eF86581a517CED608839d4D24E49d41187c",
  "0x7E1E69937a38ec0EAb971CD1636943e534C657Ef",
  "0x6B99F330Bd277e17a092922Fb8036c9B000F9365",
  "0xc156E06e7e94a31250eF2DDeEe338f1E36C3b956",
  "0x7e31765855d6251837122e042c02518F4e1Bc3f3",
  "0xBE584AfCcAd0882d24F6cF2c27BC997b49A6c367",
  "0x60b6642207a157455746cFaF7273B4b2691e5416",
  "0x84a04bca517C77d06D2A01b44431Ccff114e82a4",
  "0xAba0f27208F05f5063887767c547e12B1235Dc41",
  "0xa53480df32d65B76cD6fCb2399786d0CFf65FD54",
  "0x79Ef83f6635Ea6BdFB0B3F7022f783ad97019F31",
  "0x69d09E0051669072914eC0bB9308aC670e214bD9",
  "0x40025ad3f5438aC971e61Ba97F9Ab1B8b818900d"
];

const abi = {
  getAllReservesTokens: "function getAllReservesTokens() view returns (tuple(string symbol, address tokenAddress)[])",
  getReserveData: "function getReserveData(address asset) view returns (uint256 unbacked, uint256 accruedToTreasuryScaled, uint256 totalAToken, uint256 totalStableDebt, uint256 totalVariableDebt, uint256 liquidityRate, uint256 variableBorrowRate, uint256 stableBorrowRate, uint256 averageStableBorrowRate, uint256 liquidityIndex, uint256 variableBorrowIndex, uint40 lastUpdateTimestamp)",
};

async function tvl(api) {
  const allReservesTokens = await api.multiCall({ 
    abi: abi.getAllReservesTokens, 
    calls: DATA_PROVIDERS_CONTRACTS
  });

  const collateralAddresses = allReservesTokens.map(i => i[0].tokenAddress);
  const debtAddresses = allReservesTokens.map(i => i[1].tokenAddress);

  const debtReserveDatas = await api.multiCall({ 
    abi: abi.getReserveData, 
    calls: DATA_PROVIDERS_CONTRACTS.map((target, i) => ({ target, params: debtAddresses[i] })),
  });

  const collateralReserveDatas = await api.multiCall({ 
    abi: abi.getReserveData, 
    calls: DATA_PROVIDERS_CONTRACTS.map((target, i) => ({ target, params: collateralAddresses[i] })),
  });
  
  api.add(collateralAddresses, collateralReserveDatas.map(i => i.totalAToken));
  api.add(debtAddresses, debtReserveDatas.map(i => i.totalAToken));

  debtReserveDatas.forEach((debtReserveData, i) => {
    const totalStableDebt = +debtReserveData.totalStableDebt || 0;
    const totalVariableDebt = +debtReserveData.totalVariableDebt || 0;
    const totalBorrowed = totalStableDebt + totalVariableDebt;
    
    api.add(debtAddresses[i], -totalBorrowed);
  });
  
  return api.getBalances();
}

async function borrowed(api) {
  const allReservesTokens = await api.multiCall({ 
    abi: abi.getAllReservesTokens, 
    calls: DATA_PROVIDERS_CONTRACTS
  });

  const debtAddresses = allReservesTokens.map(i => i[1].tokenAddress);

  // Get reserve data for this configurator (the configurator address is the reserve)
  const debtReserveDatas = await api.multiCall({ 
    abi: abi.getReserveData, 
    calls: DATA_PROVIDERS_CONTRACTS.map((target, i) => ({ target, params: debtAddresses[i] })),
  });

  debtReserveDatas.forEach((debtReserveData, i) => {
    const totalStableDebt = +debtReserveData.totalStableDebt || 0;
    const totalVariableDebt = +debtReserveData.totalVariableDebt || 0;
    const totalBorrowed = totalStableDebt + totalVariableDebt;
    
    api.add(debtAddresses[i], totalBorrowed);
  });

  return api.getBalances();
}

module.exports = {
  methodology: 'TVL accounts for all assets deposited into the Vaults. Borrowed amounts are calculated as the total amount of tokens borrowed from the lending pools.',
  mantle: { 
    tvl,
    borrowed,
    staking: staking(StakingContract, TokenContract)
  },
};
