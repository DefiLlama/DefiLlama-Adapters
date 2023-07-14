const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

const v320Address = '0x68a154fB3e8ff6e4DA10ECd54DEF25D9149DDBDE';

const WETH_CONTRACT = ADDRESSES.arbitrum.WETH;
const USDC_CONTRACT = ADDRESSES.arbitrum.USDC;

const abi = {
    v3: {
        getTokenState: 'function getTokenState() returns (tuple(uint256 totalCompoundDeposited, uint256 totalCompoundBorrowed, uint256 totalNormalDeposited, uint256 totalNormalBorrowed, uint256 assetScaler, uint256 debtScaler, uint256 assetGrowth, uint256 debtGrowth), tuple(uint256 totalCompoundDeposited, uint256 totalCompoundBorrowed, uint256 totalNormalDeposited, uint256 totalNormalBorrowed, uint256 assetScaler, uint256 debtScaler, uint256 assetGrowth, uint256 debtGrowth))'
    },
    v320: {
        getAsset: 'function getAsset(uint256 _id) external view returns (tuple(uint256 id, address token, address supplyTokenAddress, tuple(uint256 riskRatio, int24 rangeSize, int24 rebalanceThreshold), tuple(uint256 totalCompoundDeposited, uint256 totalCompoundBorrowed, uint256 totalNormalDeposited, uint256 totalNormalBorrowed, uint256 assetScaler, uint256 debtScaler, uint256 assetGrowth, uint256 debtGrowth), tuple(address uniswapPool, int24 tickLower, int24 tickUpper, uint256 totalAmount, uint256 borrowedAmount, uint256 supplyPremiumGrowth, uint256 borrowPremiumGrowth, uint256 fee0Growth, uint256 fee1Growth, tuple(int256 positionAmount, uint256 lastFeeGrowth), tuple(int256 positionAmount, uint256 lastFeeGrowth), int256 rebalanceFeeGrowthUnderlying, int256 rebalanceFeeGrowthStable), bool isMarginZero, tuple(uint256 baseRate, uint256 kinkRate, uint256 slope1, uint256 slope2), tuple(uint256 baseRate, uint256 kinkRate, uint256 slope1, uint256 slope2), uint256 lastUpdateTimestamp, uint256 accumulatedProtocolRevenue))'
    }
}


async function borrowed(_time, _ethBlock, chainBlocks, { api }) {
    // V3.2
    const v320USDCState = await api.call({ abi: abi.v320.getAsset, target: v320Address, params: 1})
    const v320ETHState = await api.call({ abi: abi.v320.getAsset, target: v320Address, params: 2 })
    api.add(WETH_CONTRACT, v320ETHState[4][3])
    api.add(USDC_CONTRACT, v320USDCState[4][3])
}


module.exports = {
    methodology: "USDC and WETH locked on predy contracts",
    arbitrum: {
        tvl: sumTokensExport({ owners: [v320Address], tokens: [USDC_CONTRACT, WETH_CONTRACT,] }),
        
    },
};
