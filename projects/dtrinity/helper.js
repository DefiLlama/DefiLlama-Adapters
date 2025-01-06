const erc20Abi = require("../helper/abis/erc20.json");
const ADDRESSES = require('../helper/coreAssets.json')

const dLendABIs = {
    getReserveTokensAddresses: "function getReserveTokensAddresses(address asset) view returns (address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress)",
    getAllReservesTokens: "function getAllReservesTokens() view returns ((string symbol, address tokenAddress)[])",
    getReserveData: "function getReserveData(address asset) view returns (uint256 unbacked, uint256 accruedToTreasuryScaled, uint256 totalAToken, uint256 totalStableDebt, uint256 totalVariableDebt, uint256 liquidityRate, uint256 variableBorrowRate, uint256 stableBorrowRate, uint256 averageStableBorrowRate, uint256 liquidityIndex, uint256 variableBorrowIndex, uint40 lastUpdateTimestamp)",
};

const CONFIG = {
    fraxtal: {
        dUSDCollateralVault: "0x624E12dE7a97B8cFc1AD1F050a1c9263b1f4FeBC",
        dUSDAMOManager: "0x49a0c8030Ca199f6F246517aE689E3cC0775271a",
        dLendProtocolDataProvider: ["0xFB3adf4c845fD6352D24F3F0981eb7954401829c"],
        dUSDCollaterals: [
            ADDRESSES.fraxtal.FRAX,
            ADDRESSES.fraxtal.sFRAX,
            ADDRESSES.fraxtal.DAI,
            ADDRESSES.fraxtal.sDAI,
            ADDRESSES.fraxtal.USDC
        ]
    }
}

const fetchReserveData = async (api, poolDatas, isBorrowed) => {
    const reserveTokens = await api.multiCall({ 
      calls: poolDatas, 
      abi: dLendABIs.getAllReservesTokens 
    });
    const calls = [];
  
    poolDatas.map((pool, i) => {
      reserveTokens[i].forEach(({ tokenAddress }) => 
        calls.push({ target: pool, params: tokenAddress })
      );
    });
  
    const reserveData = await api.multiCall({ 
      abi: isBorrowed ? dLendABIs.getReserveData : dLendABIs.getReserveTokensAddresses, 
      calls 
    });
  
    const tokensAndOwners = [];
    reserveData.forEach((data, i) => {
      const token = calls[i].params;
      if (isBorrowed) {
        api.add(token, data.totalVariableDebt);
      } else {
        tokensAndOwners.push([token, data.aTokenAddress]);
      }
    });
  
    if (isBorrowed) return api.getBalances();
    return api.sumTokens({ tokensAndOwners });
}

const dUSDCollateralTvl = async (api) => {
    const chain = api.chain;
    const vault = CONFIG[chain].dUSDCollateralVault;
    const collaterals = CONFIG[chain].dUSDCollaterals;
    for (const token of collaterals) {
        const balance = await api.call({
            abi: erc20Abi.balanceOf,
            target: token,
            params: [vault] 
        });
        api.add(token, balance);
    }
}

const dUSDAMOTvl = async (api) => {
    const chain = api.chain;
    const dUSDAMOManager = CONFIG[chain].dUSDAMOManager;
    const totalAmoSupply = await api.call({
        abi: "function totalAmoSupply() public view returns (uint256)",
        target: dUSDAMOManager
    });
    api.add(ADDRESSES.fraxtal.dUSD, totalAmoSupply);
}

const dLendTvl = async (api) => {
    const chain = api.chain;
    const poolDatas = CONFIG[chain].dLendProtocolDataProvider;
    const baseTokens = await fetchReserveData(api, poolDatas);
    const borrowedTokens = await fetchReserveData(api, poolDatas, true);
    return {
      ...baseTokens,
      ...borrowedTokens
    };
}

const dLendBorrowed = async (api) => {
    const chain = api.chain;
    const poolDatas = CONFIG[chain].dLendProtocolDataProvider;
    const borrowedTokens = await fetchReserveData(api, poolDatas, true);
    return borrowedTokens;
}

module.exports = {
    dUSDCollateralTvl,
    dUSDAMOTvl,
    dLendTvl,
    dLendBorrowed
};