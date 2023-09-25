const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

const v3Address = '0x4006A8840F8640A7D8F46D2c3155a58c76eCD56e';

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
    // V3
    const v3TokenState = await api.call({ abi: abi.v3.getTokenState, target: v3Address, })
    api.add(WETH_CONTRACT, v3TokenState[0].totalNormalBorrowed)
    api.add(USDC_CONTRACT, v3TokenState[1].totalNormalBorrowed)

}


module.exports = {
    methodology: "USDC and WETH locked on predy contracts",
    arbitrum: {
        tvl: sumTokensExport({ owners: [v3Address], tokens: [USDC_CONTRACT, WETH_CONTRACT,] }),
    },
};
