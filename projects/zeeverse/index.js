const { stakings } = require("../helper/staking");
const {pool2} = require("../helper/pool2");

const STAKING_ARB = "0x73cc0baf79ccb12ad661725377474ed6a1366fb6";
const MAGIC_TOKEN = "0x539bde0d7dbd336b79148aa742883198bbf60342";
const LP_POOL = "0x6210775833732f144058713c9b36de09afd1ca3b";
const VEE_TOKEN_ARB = "0x0caadd427a6feb5b5fc1137eb05aa7ddd9c08ce9";
const VEE_TOKEN_ETH = "0x7616113782aadab041d7b10d474f8a0c04eff258";
const LAND_STAKE = "0x95cd6D620A79998CB7519256F4d5f5cd705ac135";
const CURVE_POOL = "0x9a81f5a6ea7e60632f659f3f4e772ba977d80bd5";
const USDC_TOKEN_ETH = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";

async function tvlArb(timestamp, block, chainBlocks, api) {
    const balanceMagic = await api.call({ abi: 'erc20:balanceOf', target: MAGIC_TOKEN, params: LP_POOL, })
    // const balanceVee = await api.call({ abi: 'erc20:balanceOf', target: VEE_TOKEN_ARB, params: LP_POOL, })
    return {
        [`arbitrum:${MAGIC_TOKEN}`]: balanceMagic * 2,
        // [`arbitrum:${VEE_TOKEN_ARB}`]: balanceVee, // No price for VEE tokens yet
    };
}

async function tvlEth(timestamp, block, chainBlocks, api) {
    // const balance = await api.call({ abi: 'erc20:balanceOf', target: VEE_TOKEN_ETH, params: LAND_STAKE, })
    const usdcBalance = await api.call({ abi: 'erc20:balanceOf', target: USDC_TOKEN_ETH, params: CURVE_POOL, })
    return {
        // [`ethereum:${VEE_TOKEN_ETH}`]: balance + balanceCurve, // No price for VEE tokens yet
        [`ethereum:${USDC_TOKEN_ETH}`]: usdcBalance * 2,
    };
}

module.exports = {
    arbitrum: {
        staking: stakings([
                LP_POOL,
                STAKING_ARB,
            ],
            VEE_TOKEN_ARB,
        ),
        pool2: pool2(LP_POOL, MAGIC_TOKEN),
        tvl: () => ({}),
    },
    ethereum: {
        staking: stakings([
                LAND_STAKE,
            ],
            VEE_TOKEN_ETH,
        ),
        tvl: () => ({}),
        pool2: pool2(CURVE_POOL, USDC_TOKEN_ETH),
    },
    start: 1716366318,
}
