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
        getAsset: 'function getAsset(uint256 _id) external view returns (uint256 id, uint256 pairGroupId, tuple( address token, address supplyTokenAddress, tuple(uint256 totalCompoundDeposited, uint256 totalNormalDeposited, uint256 totalNormalBorrowed, uint256 assetScaler, uint256 assetGrowth, uint256 debtGrowth), tuple(uint256 baseRate, uint256 kinkRate, uint256 slope1, uint256 slope2)), tuple(address token, address supplyTokenAddress, tuple(uint256 totalCompoundDeposited, uint256 totalNormalDeposited, uint256 totalNormalBorrowed, uint256 assetScaler, uint256 assetGrowth, uint256 debtGrowth), tuple(uint256 baseRate, uint256 kinkRate, uint256 slope1, uint256 slope2)), tuple(uint256 riskRatio, int24 rangeSize, int24 rebalanceThreshold), tuple(address uniswapPool, int24 tickLower, int24 tickUpper, uint64 numRebalance, uint256 totalAmount, uint256 borrowedAmount, uint256 lastRebalanceTotalSquartAmount, uint256 lastFee0Growth, uint256 lastFee1Growth, uint256 borrowPremium0Growth, uint256 borrowPremium1Growth, uint256 fee0Growth, uint256 fee1Growth, tuple(int256 positionAmount, uint256 lastFeeGrowth), tuple(int256 positionAmount, uint256 lastFeeGrowth), int256 rebalanceFeeGrowthUnderlying, int256 rebalanceFeeGrowthStable))'
    }
}


async function borrowed(_time, _ethBlock, chainBlocks, { api }) {
    let balances = {};

    // pairGroupId = 1, pair of USDC.e
    const WETH_ASSET_ID = 1;
    const ARB_ASSET_ID = 2;
    const WBTC_ASSET_ID = 3;
    const GYEN_ASSET_ID = 4;
    const LUSD_ASSET_ID = 5;
    const WETHEX_ASSET_ID = 6;

    // pairGroupId = 2, pair of USDC
    // ID = 7,8,9

    // pairGroupId = 3, pair of WETH
    // ID = 10,11,12,13

    // V5
    const WETH = await api.call({ abi: abi.v5.getAsset, target: v5Address, params: WETH_ASSET_ID})
    const ARB = await api.call({ abi: abi.v5.getAsset, target: v5Address, params: ARB_ASSET_ID })
    const GYEN = await api.call({ abi: abi.v5.getAsset, target: v5Address, params: GYEN_ASSET_ID })
    const LUSD = await api.call({ abi: abi.v5.getAsset, target: v5Address, params: LUSD_ASSET_ID })
    const WETHEX = await api.call({ abi: abi.v5.getAsset, target: v5Address, params: WETHEX_ASSET_ID })

    // WETH pair
    const usdcBorrowedForWETH = new BigNumber(WETH[2][2][2]).toNumber();
    const wethBorrowedForWETH = new BigNumber(WETH[3][2][2]).toNumber();

    await sdk.util.sumSingleBalance(balances, USDC_CONTRACT, usdcBorrowedForWETH, api.chain);
    await sdk.util.sumSingleBalance(balances, WETH_CONTRACT, wethBorrowedForWETH, api.chain);

    // ARB pair
    const usdcBorrowedForARB = ARB[2][2][2]
    const arbBorrowedForARB = ARB[3][2][2]
    
    await sdk.util.sumSingleBalance(balances, USDC_CONTRACT, usdcBorrowedForARB, api.chain);
    await sdk.util.sumSingleBalance(balances, ARB_CONTRACT, arbBorrowedForARB, api.chain);

    // GYEN pair
    const usdcBorrowedForGYEN = GYEN[2][2][2]
    const gyenBorrowedForGYEN = GYEN[3][2][2]

    await sdk.util.sumSingleBalance(balances, USDC_CONTRACT, usdcBorrowedForGYEN, api.chain);
    await sdk.util.sumSingleBalance(balances, GYEN_CONTRACT, gyenBorrowedForGYEN, api.chain);

    // LUSD pair
    const usdcBorrowedForLUSD = LUSD[2][2][2]
    const lusdBorrowedForLUSD = LUSD[3][2][2]

    await sdk.util.sumSingleBalance(balances, USDC_CONTRACT, usdcBorrowedForLUSD, api.chain);
    await sdk.util.sumSingleBalance(balances, LUSD_CONTRACT, lusdBorrowedForLUSD, api.chain);

    // WETHEX pair
    const usdcBorrowedForWETHEX = WETHEX[2][2][2]
    const wethexBorrowedForWETHEX = WETHEX[3][2][2]

    await sdk.util.sumSingleBalance(balances, USDC_CONTRACT, usdcBorrowedForWETHEX, api.chain);
    await sdk.util.sumSingleBalance(balances, WETH_CONTRACT, wethexBorrowedForWETHEX, api.chain);
    
    return balances;
}


module.exports = {
    methodology: "USDC and WETH locked on predy contracts",
    arbitrum: {
        tvl: sumTokensExport({ owners: [v5Address], tokens: [WETH_CONTRACT, ARB_CONTRACT, USDC_CONTRACT, GYEN_CONTRACT, LUSD_CONTRACT] }),
        borrowed
    },
    hallmarks: [
        [1671092333, "Launch Predy V3"],
        [1678734774, "Launch Predy V3.2"],
        [1688490168, "Launch Predy V5"]
    ],
};
