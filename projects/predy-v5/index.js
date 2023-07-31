const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk');
const { sumTokensExport } = require('../helper/unwrapLPs')
const BigNumber = require("bignumber.js");

const v5Address = '0x06a61E55d4d4659b1A23C0F20AEdfc013C489829';

const WETH_CONTRACT = ADDRESSES.arbitrum.WETH;
const ARB_CONTRACT = '0x912CE59144191C1204E64559FE8253a0e49E6548';
const USDC_CONTRACT = ADDRESSES.arbitrum.USDC;
const GYEN_CONTRACT = '0x589d35656641d6aB57A545F08cf473eCD9B6D5F7';
const LUSD_CONTRACT = '0x93b346b6BC2548dA6A1E7d98E9a421B42541425b';

const abi = {
    v5: {
        getAsset: 'function getAsset(uint256 _id) external view returns (tuple(uint256 id, address token, address supplyTokenAddress, tuple(uint256 riskRatio, int24 rangeSize, int24 rebalanceThreshold), tuple(uint256 totalCompoundDeposited, uint256 totalCompoundBorrowed, uint256 totalNormalDeposited, uint256 totalNormalBorrowed, uint256 assetScaler, uint256 debtScaler, uint256 assetGrowth, uint256 debtGrowth), tuple(address uniswapPool, int24 tickLower, int24 tickUpper, uint256 totalAmount, uint256 borrowedAmount, uint256 supplyPremiumGrowth, uint256 borrowPremiumGrowth, uint256 fee0Growth, uint256 fee1Growth, tuple(int256 positionAmount, uint256 lastFeeGrowth), tuple(int256 positionAmount, uint256 lastFeeGrowth), int256 rebalanceFeeGrowthUnderlying, int256 rebalanceFeeGrowthStable), bool isMarginZero, tuple(uint256 baseRate, uint256 kinkRate, uint256 slope1, uint256 slope2), tuple(uint256 baseRate, uint256 kinkRate, uint256 slope1, uint256 slope2), uint256 lastUpdateTimestamp, uint256 accumulatedProtocolRevenue))'
    }
}


async function borrowed(_time, _ethBlock, chainBlocks, { api }) {
    let balances = {};

    // pairGroupId = 1, USDC.e
    const WETH_ASSET_ID = 1;
    const ARB_ASSET_ID = 2;
    const WBTC_ASSET_ID = 3;
    const GYEN_ASSET_ID = 4;
    const LUSD_ASSET_ID = 5;
    const WETHEX_ASSET_ID = 6;

    // pairGroupId = 2, USDC
    // ID = 7,8,9

    // pairGroupId = 3, WETH
    // ID = 10,11,12,13

    // V5
    const WETH = await api.call({ abi: abi.v5.getAsset, target: v5Address, params: WETH_ASSET_ID})
    const ARB = await api.call({ abi: abi.v5.getAsset, target: v5Address, params: ARB_ASSET_ID })
    const GYEN = await api.call({ abi: abi.v5.getAsset, target: v5Address, params: GYEN_ASSET_ID })
    const LUSD = await api.call({ abi: abi.v5.getAsset, target: v5Address, params: LUSD_ASSET_ID })
    const WETHEX = await api.call({ abi: abi.v5.getAsset, target: v5Address, params: WETHEX_ASSET_ID })
    
    const WETHBorrowed = (new BigNumber(WETH[5][4])).toNumber()
    const ARBBorrowed = (new BigNumber(ARB[5][4])).toNumber()
    const GYENBorrowed = (new BigNumber(GYEN[5][4])).toNumber()
    const LUSDBorrowed = (new BigNumber(LUSD[5][4])).toNumber()
    const WETHEXBorrowed = (new BigNumber(WETHEX[5][4])).toNumber()

    await sdk.util.sumSingleBalance(balances, WETH_CONTRACT, WETHBorrowed, api.chain);
    await sdk.util.sumSingleBalance(balances, ARB_CONTRACT, ARBBorrowed, api.chain);
    await sdk.util.sumSingleBalance(balances, GYEN_CONTRACT, GYENBorrowed, api.chain);
    await sdk.util.sumSingleBalance(balances, LUSD_CONTRACT, LUSDBorrowed, api.chain);
    await sdk.util.sumSingleBalance(balances, WETH_CONTRACT, WETHEXBorrowed, api.chain);
    
    return balances;
}


module.exports = {
    methodology: "USDC and WETH locked on predy contracts",
    arbitrum: {
        tvl: sumTokensExport({ owners: [v5Address], tokens: [USDC_CONTRACT, WETH_CONTRACT,] }),
        borrowed
    },
    hallmarks: [
        [1671092333, "Launch Predy V3"],
        [1678734774, "Launch Predy V3.2"],
        [1688490168, "Launch Predy V5"]
    ],
};
