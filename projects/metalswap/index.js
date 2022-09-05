const sdk = require("@defillama/sdk");

const {
    transformBscAddress,
    transformPolygonAddress
} = require("../helper/portedTokens");

// TOKENS
const ETH_TOKEN_CONTRACT = "0x0000000000000000000000000000000000000000";
const ETH_XMT_CONTRACT = "0x3E5D9D8a63CC8a88748f229999CF59487e90721e";
const ETH_TETHER_CONTRACT = "0xdac17f958d2ee523a2206206994597c13d831ec7";
const ETH_WBTC_CONTRACT = "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599";

const ETH_USDC_CONTRACT = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const WETH_CONTRACT = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

// pool2 ETH
const ETH_UNISWAP_ADDRESSES = [
    "0xb143bbeb287dcd1034da6e7186ec695316fff78f",
    "0x8ea45f0bf608d553a4d8837ebdd5b2c7d0eba772",
    "0x78a3d03598c39bc8cfad331ceeaea0ca5345fe6a"
];

// staking ETH
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

const ETH_LIQUIDITY_SWAP_POOL = [
    "0xaAA50f60a256b74D1C71ED4AD739836b50059201",
    "0x51bb873D5b68309cf645e84234bC290b7D991D2C",
    "0xdCE224F9299CDd66e4D01D196d4cabce35a2F478"
];

// BSC

// BSC TOKENS
const BSC_XMT_CONTRACT = "0x582c12b30f85162fa393e5dbe2573f9f601f9d91";
const WBNB_CONTRACT = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";

// Staking
const BSC_POOLS_ADDRESSES = [
    "0xd38b66aACA9819623380f60814308c6594E2DC26",
    "0xd9b5b86De1F696dFe290803b92Fe5e9baCa9371A",
    "0xbEe93fD8822c3a61068Abf54A28734644c9f61Ed"
];

const BSC_SMART_POOLS_ADDRESSES = [
    "0x306825856807321671d21d4A2A9a65b02CCB51db",
    "0x842fDf4A6e861983D3Ef9299bF26EFC1FDB1Ba7A"
];

// pool2
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

// pool2
const POLYGON_LIQUIDITY_POOLS = [
    "0x2c92547ea81d9855e55ca7ac66956bfccbaf11d2",
    "0xf7abb7dee889da4300a82c26f8c0c725c64bd493"
];

// TVL
const POLYGON_NFT_STAKING_CONTRACT = "0x313c3F878998622f18761d609AA007F2bbC378Db";


// ETHEREUM

/**
 * 
 * @param {Number} timestamp - Can be the current or past timestamp when we back fill chart data for your protocol.
 * @param {Number} block - Ethereum mainnet block height corresponding the timestamp in the first param
 * @param {*} chainBlocks - Optional object containing block heights for other EVM chains. This is not needed if your project is only on Ethereum mainnet 
 * @returns the balance objects
 */
const tvlEthereum = async (timestamp, block, chainBlocks) => {

    const balances = {};

    await Promise.all([
        extractEtherFromLiquidityPools(balances, timestamp, block),
        extractEthereumTotalValueLockedPerCurrency(balances, ETH_XMT_CONTRACT, chainBlocks),
        extractEthereumTotalValueLockedPerCurrency(balances, ETH_TETHER_CONTRACT, chainBlocks),
        extractEthereumTotalValueLockedPerCurrency(balances, ETH_WBTC_CONTRACT, chainBlocks)
    ]);

    return balances;
}

const extractEtherFromLiquidityPools = async (balances, timestamp, block) => {

    for (let i = 0; i < ETH_LIQUIDITY_SWAP_POOL.length; i++) {

        try {
            let balance = (await sdk.api.eth.getBalance({ target: ETH_LIQUIDITY_SWAP_POOL[i], block }))?.output ?? 0;
            if (+balance !== 0) sdk.util.sumSingleBalance(balances, ETH_TOKEN_CONTRACT, balance);
        } catch (err) {
            console.log("Error ", err);
        }
    }
}

const extractEthereumTotalValueLockedPerCurrency = async (balances, tokenAddress, chainBlocks) => {

    for (let i = 0; i < ETH_LIQUIDITY_SWAP_POOL.length; i++) {

        const collateralBalance = await makeOnChainFunctionCall(
            "erc20:balanceOf",
            undefined,
            tokenAddress,
            [ETH_LIQUIDITY_SWAP_POOL[i]],
            undefined
        );

        sdk.util.sumSingleBalance(balances, tokenAddress, collateralBalance);
    }
}

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
const stakingEthereum = async (timestamp, block, chainBlocks) => {

    // A dictionary where all the keys are either token addresses or Coingecko token IDs
    // If a token balance has an address key, the DefiLlama SDK will manage any raw to real amount conversion for you (so you don'gitt need to worry about erc20 decimals).
    // If a token balance has a Coingecko ID key, you will need to process the decimals and use a real token amount in the balances object.
    const balances = {};

    await Promise.all([
        extractEthereumStakedPerCurrency(balances, ETH_XMT_CONTRACT),
        extractEthereumStakedPerCurrency(balances, ETH_TETHER_CONTRACT),
        extractEthereumStakedPerCurrency(balances, ETH_USDC_CONTRACT),
        extractEthereumStakedPerCurrency(balances, ETH_WBTC_CONTRACT),
        extractEthereumStakedPerCurrency(balances, WETH_CONTRACT),
        extractEthereumPool2PerCurrency(balances, ETH_XMT_CONTRACT),
    ]);

    return balances;
}

const extractEthereumStakedPerCurrency = async (balances, currencyAddress) => {

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

const pool2Ethereum = async (timestamp, block, chainBlocks) => {

    const balances = {};

    await Promise.all([
        extractEthereumPool2PerCurrency(balances, ETH_TETHER_CONTRACT),
        extractEthereumPool2PerCurrency(balances, ETH_USDC_CONTRACT),
        extractEthereumPool2PerCurrency(balances, ETH_WBTC_CONTRACT),
        extractEthereumPool2PerCurrency(balances, WETH_CONTRACT),
    ]);

    return balances;
}

const extractEthereumPool2PerCurrency = async (balances, currencyAddress) => {

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
}

// BINANCE

/**
 * 
 * @param {Number} timestamp - Can be the current or past timestamp when we back fill chart data for your protocol.
 * @param {Number} block - Ethereum mainnet block height corresponding the timestamp in the first param
 * @param {*} chainBlocks - Optional object containing block heights for other EVM chains. This is not needed if your project is only on Ethereum mainnet 
 * @returns the balance objects
 */
const stakingBSC = async (timestamp, block, chainBlocks) => {

    const balances = {};

    // Many assets have been deployed on multiple chains.
    // It"s hard for CoinGecko to keep up with asset addresses for every chain, so sometimes we have to transform the addresses to ones known by CoinGecko.
    // We have managed most cases for you in the transform__Address() functions, found in projects/helper/portedTokens.js
    const transform = await transformBscAddress();

    await Promise.all([
        extractBinanceStakingPerCurrency(
            balances,
            BSC_XMT_CONTRACT,
            transform,
            chainBlocks
        ),
        extractBinanceStakingPerCurrency(
            balances,
            BSC_XMT_CONTRACT,
            transform,
            chainBlocks
        ),
        extractBinanceStakingPerCurrency(
            balances,
            WBNB_CONTRACT,
            transform,
            chainBlocks
        ),
    ]);

    return balances;
}

const extractBinanceStakingPerCurrency = async (balances, currencyAddress, transform, chainBlocks) => {

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
}

const pool2BSC = async (timestamp, block, chainBlocks) => {

    const balances = {};

    // Many assets have been deployed on multiple chains.
    // It"s hard for CoinGecko to keep up with asset addresses for every chain, so sometimes we have to transform the addresses to ones known by CoinGecko.
    // We have managed most cases for you in the transform__Address() functions, found in projects/helper/portedTokens.js
    const transform = await transformBscAddress();

    await Promise.all([

        extractBinanceCurrencyBalanceFromPancakeswap(balances, WBNB_CONTRACT, transform, chainBlocks),
        extractAcryptosXMTTotalValueLocked(balances, transform, chainBlocks)
    ]);

    return balances;
}

const extractBinanceCurrencyBalanceFromPancakeswap = async (
    balances,
    currencyAddress,
    transform,
    chainBlocks
) => {

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

    const collateralBalance = await makeOnChainFunctionCall(
        "erc20:balanceOf",
        'polygon',
        currencyAddress,
        [POLYGON_NFT_STAKING_CONTRACT],
        chainBlocks['polygon']
    );

    sdk.util.sumSingleBalance(balances, transform(currencyAddress), collateralBalance);
}

const pool2Polygon = async (timestamp, block, chainBlocks) => {

    const balances = {};

    const transform = await transformPolygonAddress();

    await Promise.all([
        extractPolygonCurrencyBalanceFromLiquidityPool(
            balances, POLYGON_USDC_CONTRACT, transform, chainBlocks),
        extractPolygonCurrencyBalanceFromLiquidityPool(
            balances, POLYGON_WMATIC_CONTRACT, transform, chainBlocks)
    ]);

    return balances;
}

const stakingPolygon = async (timestamp, block, chainBlocks) => {

    const balances = {};

    const transform = await transformPolygonAddress();

    await extractPolygonCurrencyBalanceFromLiquidityPool(
        balances,
        POLYGON_XMT_CONTRACT,
        transform,
        chainBlocks
    );

    return balances;
}

const extractPolygonCurrencyBalanceFromLiquidityPool = async (balances, currencyAddress, transform, chainBlocks) => {

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

    const callParameters = { abi, target, block };

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
    ethereum: {
        tvl: tvlEthereum,
        staking: stakingEthereum,
        pool2: pool2Ethereum,
    },
    bsc: {
        tvl: async () => ({}),
        staking: stakingBSC,
        pool2: pool2BSC,
    },
    polygon: {
        tvl: tvlPolygon,
        pool2: pool2Polygon,
        staking: stakingPolygon,
    }
};