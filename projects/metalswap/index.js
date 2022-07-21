const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");

const {
    transformBscAddress,
    transformPolygonAddress
} = require("../helper/portedTokens");

const { getChainTransform } = require("../helper/portedTokens");

const ETH_XMT_CONTRACT = "0x3E5D9D8a63CC8a88748f229999CF59487e90721e";
const ETH_TETHER_CONTRACT = "0xdac17f958d2ee523a2206206994597c13d831ec7";
const ETH_USDC_CONTRACT = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const ETH_WBTC_CONTRACT = "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599";
const WETH_CONTRACT = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

const ETH_UNISWAP_ADDRESSES = [
    "0xb143bbeb287dcd1034da6e7186ec695316fff78f",
    "0x8ea45f0bf608d553a4d8837ebdd5b2c7d0eba772",
    "0x78a3d03598c39bc8cfad331ceeaea0ca5345fe6a"
];

const ETH_NFT_PREORDER_CONTRACT = "0x6b392C307E0Fe2a8BE3687Bc780D4157592F4aC2";
const ETH_DAO_CONTRACT = "0xc35BD9072de45215a25EB9DADB4fA54eea445a01";

const ETH_POOLS_ADDRESSES = [
    "0xd9b5b86De1F696dFe290803b92Fe5e9baCa9371A",
    "0xbEe93fD8822c3a61068Abf54A28734644c9f61Ed",
    "0xB9B17B61F7Cf8BDB192547948d5379C8EeaF3cd8",
    "0xCbD0F8e80e32B8e82f21f39FDE0A8bcf18535B21"
];

const ETH_PREMIUM_POOLS_ADDRESSES = [
    "0xcbF519299A115e325d6C82b514358362A9CA6ee5",
    "0xaF9101314b14D8e243e1D519c0dd4e69DFd44466"
];

// BSC

// BSC TOKENS
const BSC_XMT_CONTRACT = "0x582c12b30f85162fa393e5dbe2573f9f601f9d91";
const WBNB_CONTRACT = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";

const BSC_POOLS_ADDRESSES = [
    "0xd38b66aACA9819623380f60814308c6594E2DC26",
    "0xd9b5b86De1F696dFe290803b92Fe5e9baCa9371A",
    "0xbEe93fD8822c3a61068Abf54A28734644c9f61Ed"
];

const BSC_SMART_POOLS_ADDRESSES = [
    "0x306825856807321671d21d4A2A9a65b02CCB51db"
];

const BSC_PANCAKESWAP_ADDRESSES = [
    "0x7062326862fc74d8731deca1d95ca1418896d67c",
    "0xb5e267fa0613c859c108132eb43eed43675454bd",
    "0x03e74f607ca88c6d0c010e8734747dc04b6c987c",
    "0x548d4968a7402d98b1a710717d43e9f4eb6ea173"
];

const ACRYPTOS_POOL_ADDRESS = "0xa82f327BBbF0667356D2935C6532d164b06cEced";

// POLYGON
const POLYGON_XMT_CONTRACT = "0xadbe0eac80f955363f4ff47b0f70189093908c04";
const POLYGON_USDC_CONTRACT = "0x2791bca1f2de4661ed88a30c99a7a9449aa84174";
const POLYGON_WMATIC_CONTRACT = "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270";

const POLYGON_LIQUIDITY_POOLS = [
    "0x2c92547ea81d9855e55ca7ac66956bfccbaf11d2",
    "0xf7abb7dee889da4300a82c26f8c0c725c64bd493"
];

const POLYGON_NFT_STAKING_CONTRACT = "0x313c3F878998622f18761d609AA007F2bbC378Db";

/**
 * 
 * @param {Number} timestamp - Can be the current or past timestamp when we back fill chart data for your protocol.
 * @param {Number} block - Ethereum mainnet block height corresponding the timestamp in the first param
 * @param {*} chainBlocks - Optional object containing block heights for other EVM chains. This is not needed if your project is only on Ethereum mainnet 
 * @returns the balance objects
 * @example 
 *  balancesObjectExample = {
        "polygon:0xc2132d05d31c914a87c6611c10748aeb04b58e8f" : 456245893460345345234,
        "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2" : 985678356234523456,
        "wrapped-bitcoin": 4.002342
    }
 */
const tvlEthereum = async (timestamp, block, chainBlocks) => {

    // A dictionary where all the keys are either token addresses or Coingecko token IDs
    // If a token balance has an address key, the DefiLlama SDK will manage any raw to real amount conversion for you (so you don'gitt need to worry about erc20 decimals).
    // If a token balance has a Coingecko ID key, you will need to process the decimals and use a real token amount in the balances object.
    const balances = {};

    await Promise.all([
        extractEthereumTotalValueLockedPerCurrency(balances, ETH_XMT_CONTRACT),
        extractEthereumTotalValueLockedPerCurrency(balances, ETH_TETHER_CONTRACT),
        extractEthereumTotalValueLockedPerCurrency(balances, ETH_USDC_CONTRACT),
        extractEthereumTotalValueLockedPerCurrency(balances, ETH_WBTC_CONTRACT),
        extractEthereumTotalValueLockedPerCurrency(balances, WETH_CONTRACT),
    ]);

    return balances;
}

const extractEthereumTotalValueLockedPerCurrency = async (balances, currencyAddress) => {

    // UNISWAP
    for (let i = 0; i < ETH_UNISWAP_ADDRESSES.length; i++) {

        const collateralBalance = await makeOnChainFunctionCall(
            "erc20:balanceOf",
            undefined,
            currencyAddress,
            [ETH_UNISWAP_ADDRESSES[i]],
            undefined
        );

        sdk.util.sumSingleBalance(balances, currencyAddress, collateralBalance);
    }

    for (let i = 0; i < ETH_POOLS_ADDRESSES.length; i++) {

        const collateralBalance = await makeOnChainFunctionCall(
            "erc20:balanceOf",
            undefined,
            currencyAddress,
            [ETH_POOLS_ADDRESSES[i]],
            undefined
        );

        sdk.util.sumSingleBalance(balances, currencyAddress, collateralBalance);
    }

    for (let i = 0; i < ETH_PREMIUM_POOLS_ADDRESSES.length; i++) {

        const collateralBalance = await makeOnChainFunctionCall(
            "erc20:balanceOf",
            undefined,
            currencyAddress,
            [ETH_PREMIUM_POOLS_ADDRESSES[i]],
            undefined
        );

        sdk.util.sumSingleBalance(balances, currencyAddress, collateralBalance);
    }

    const collateralDAOBalance = await makeOnChainFunctionCall(
        "erc20:balanceOf",
        undefined,
        currencyAddress,
        [ETH_DAO_CONTRACT],
        undefined
    );

    sdk.util.sumSingleBalance(balances, currencyAddress, collateralDAOBalance);

    const collateralPreorderBalance = await makeOnChainFunctionCall(
        "erc20:balanceOf",
        undefined,
        currencyAddress,
        [ETH_NFT_PREORDER_CONTRACT],
        undefined
    );

    sdk.util.sumSingleBalance(balances, currencyAddress, collateralPreorderBalance);
}

/**
 * 
 * @param {Number} timestamp - Can be the current or past timestamp when we back fill chart data for your protocol.
 * @param {Number} block - Ethereum mainnet block height corresponding the timestamp in the first param
 * @param {*} chainBlocks - Optional object containing block heights for other EVM chains. This is not needed if your project is only on Ethereum mainnet 
 * @returns the balance objects
 */
const tvlBinance = async (timestamp, block, chainBlocks) => {

    const balances = {};

    // Many assets have been deployed on multiple chains.
    // It"s hard for CoinGecko to keep up with asset addresses for every chain, so sometimes we have to transform the addresses to ones known by CoinGecko.
    // We have managed most cases for you in the transform__Address() functions, found in projects/helper/portedTokens.js
    const transform = await transformBscAddress();

    await Promise.all([
        extractBinanceTotalValueLockedPerCurrency(balances, BSC_XMT_CONTRACT, transform, chainBlocks),
        extractBinanceTotalValueLockedPerCurrency(balances, WBNB_CONTRACT, transform, chainBlocks),
        extractAcryptosXMTTotalValueLocked(balances, transform, chainBlocks)
    ]);

    return balances;
}

const extractBinanceTotalValueLockedPerCurrency = async (balances, currencyAddress, transform, chainBlocks) => {

    for (let i = 0; i < BSC_POOLS_ADDRESSES.length; i++) {

        const collateralBalance = await makeOnChainFunctionCall(
            "erc20:balanceOf",
            'bsc',
            currencyAddress,
            [BSC_POOLS_ADDRESSES[i]],
            chainBlocks['bsc']
        );

        sdk.util.sumSingleBalance(balances, transform(currencyAddress), collateralBalance);
    }

    for (let i = 0; i < BSC_SMART_POOLS_ADDRESSES.length; i++) {

        const collateralBalance = await makeOnChainFunctionCall(
            "erc20:balanceOf",
            'bsc',
            currencyAddress,
            [BSC_SMART_POOLS_ADDRESSES[i]],
            chainBlocks['bsc']
        );

        sdk.util.sumSingleBalance(balances, transform(currencyAddress), collateralBalance);
    }

    for (let i = 0; i < BSC_PANCAKESWAP_ADDRESSES.length; i++) {

        const collateralBalance = await makeOnChainFunctionCall(
            "erc20:balanceOf",
            'bsc',
            currencyAddress,
            [BSC_PANCAKESWAP_ADDRESSES[i]],
            chainBlocks['bsc']
        );

        sdk.util.sumSingleBalance(balances, transform(currencyAddress), collateralBalance);
    }
}

const extractAcryptosXMTTotalValueLocked = async (balances, transform, chainBlocks) => {

    const collateralBalance = await makeOnChainFunctionCall(
        "erc20:balanceOf",
        'bsc',
        BSC_XMT_CONTRACT,
        [ACRYPTOS_POOL_ADDRESS],
        chainBlocks['bsc']
    );

    sdk.util.sumSingleBalance(balances, transform(BSC_XMT_CONTRACT), collateralBalance);
}

/**
 * 
 * @param {Number} timestamp - Can be the current or past timestamp when we back fill chart data for your protocol.
 * @param {Number} block - Ethereum mainnet block height corresponding the timestamp in the first param
 * @param {*} chainBlocks - Optional object containing block heights for other EVM chains. This is not needed if your project is only on Ethereum mainnet 
 * @returns the balance objects
 */
const tvlPolygon = async (timestamp, block, chainBlocks) => {

    const balances = {};

    const transform = await transformPolygonAddress();

    await Promise.all([
        extractPolygonTotalValueLockedPerCurrency(balances, POLYGON_XMT_CONTRACT, transform, chainBlocks),
        extractPolygonTotalValueLockedPerCurrency(balances, POLYGON_USDC_CONTRACT, transform, chainBlocks),
        extractPolygonTotalValueLockedPerCurrency(balances, POLYGON_WMATIC_CONTRACT, transform, chainBlocks)
    ]);

    return balances;
}

const extractPolygonTotalValueLockedPerCurrency = async (balances, currencyAddress, transform, chainBlocks) => {

    // Liquidity Pools
    for (let i = 0; i < POLYGON_LIQUIDITY_POOLS.length; i++) {

        const collateralBalance = await makeOnChainFunctionCall(
            "erc20:balanceOf",
            'polygon',
            currencyAddress,
            [POLYGON_LIQUIDITY_POOLS[i]],
            chainBlocks['polygon']
        );

        sdk.util.sumSingleBalance(balances, transform(currencyAddress), collateralBalance);
    }

    const collateralBalance = await makeOnChainFunctionCall(
        "erc20:balanceOf",
        'polygon',
        currencyAddress,
        [POLYGON_NFT_STAKING_CONTRACT],
        chainBlocks['polygon']
    );

    sdk.util.sumSingleBalance(balances, transform(currencyAddress), collateralBalance);
}

/**
 * Function that can be used to call all sorts of contract functions
 * @param {*} abi - Because we have used a common erc20 function for Mint Club, we"re able to use a string for the "abi" parameter. However for other contract functions you will need to pass a JSON ABI (can find these on etherscan)
 * @param {*} chain - An optional parameter (defaults to Ethereum) which determines which chain the contract call is made on.
 * @param {*} target - address of the contract call.
 * @param {*} params - Optional, must take the same amount of params expected by the on-chain contract function
 * @param {*} block -  The block height that the contract call will be executed on. This should always correspond to the chain parameter, and in this case we use the chainBlocks object to get the bsc block height (remember, the second param on line 6 is the Ethereum mainnet block, not BSCs, which we are interested in for Mint Club)
 * @returns 
 */
const makeOnChainFunctionCall = async (abi, chain, target, params, block) => {

    const callParameters = {
        abi,
        target,
        block
    }

    if (chain !== undefined) callParameters.chain = chain;

    if (params !== undefined) callParameters.params = params;

    if (block !== undefined) callParameters.block = block;

    const { output } = await sdk.api.abi.call(callParameters);

    return output;
}

module.exports = {
    timetravel: true,
    misrepresentedTokens: false,
    methodology: "counts the number of MINT tokens in the Club Bonding contract.",
    start: 1000235,
    ethereum: { tvl: tvlEthereum },
    bsc: { tvl: tvlBinance },
    polygon: { tvl: tvlPolygon }
};