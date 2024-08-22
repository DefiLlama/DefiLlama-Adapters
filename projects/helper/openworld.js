const sdk = require('@defillama/sdk');
const { util } = require("@defillama/sdk");

const tokenAddresses = {
    USDC: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    USDT: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
    WETH: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    OPEN: '0x58CB98A966F62aA6F2190eB3AA03132A0c3de3D5',
    USDCe: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
    WBTC: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
    DAI: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
    wstETH: '0x5979D7b546E38E414F7E9822514be443A4800529',
    ARB: '0x912CE59144191C1204E64559FE8253a0e49E6548',
    PENDLE: '0x0c880f6761F1af8d9Aa9C466984b80DAb9a8c9e8',
    GMX: '0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a'
};

const vaults = [
    { token: 'USDC', address: '0xb4666dD97a438cd908DBB770b929366a004C774C' },
    { token: 'USDT', address: '0x50a37a3B3E88b4b170C3265d803618989dE34310' },
    { token: 'WETH', address: '0xA9e68b83255dedf0a4c2F9a0B6f6f708C3e6302C' },
    { token: 'OPEN', address: '0x1Ca82B15b82f678359565CAf5e7fd240b41bA10C' },
    { token: 'USDCe', address: '0x71CfAE74536E06526B0E4aAA86bDa3CA0C95C592' },
];

const farms = [
    { name: 'ARB_WETH_STABLE', address: '0x7f9c4dE69F41653466c155B0E5E730CB8D5c351d', tokens: ['ARB', 'WETH'] },
    { name: 'USDC_WETH_STABLE', address: '0x7b4Eb4C51b7EEc8dEAFB26B76339e8Ea6a475D7C', tokens: ['USDC', 'WETH'] },
    { name: 'WBTC_WETH_STABLE', address: '0xd9d2A9434b3662dDba99358032D11ddfB6d77900', tokens: ['WBTC', 'WETH'] },
    { name: 'WETH_USDT_STABLE', address: '0x4eD4648BE9e163e81c43631549E2c6AbaF7076c4', tokens: ['WETH', 'USDT'] },
    { name: 'USDC_USDT_SUPER_STABLE', address: '0xcE4AaFFe10d92c94778a05eC76d48711cF8Be675', tokens: ['USDC', 'USDT'] },
    { name: 'WBTC_USDT_STABLE', address: '0xF1Ac8507bFD7992f2Ac2A72550BBB15B30E34FCB', tokens: ['WBTC', 'USDT'] },
    { name: 'DAI_USDT_SUPER_STABLE', address: '0x570c80fb5b05d658093489b4f72161de171837ec', tokens: ['DAI', 'USDT'] },
    { name: 'USDC_WBTC_STABLE', address: '0xcF7D782C0d5e0f41a7CB058DF7124416517d7764', tokens: ['USDC', 'WBTC'] },
    { name: 'USDCe_USDC_SUPER_STABLE', address: '0x2dA7ecb1796eb73649aB5eb11a3B448ca9A01cBc', tokens: ['USDCe', 'USDC'] },
    { name: 'wstETH_WETH_SUPER_STABLE', address: '0x00006F4A02526529f1b6582536919DA903255731', tokens: ['wstETH', 'WETH'] },
    { name: 'USDCe_WETH_STABLE', address: '0x75F8c2c7E47DC23439BAe98941D855796cD1f9DB', tokens: ['USDCe', 'WETH'] },
    { name: 'OPEN_WETH_NORMAL', address: '0x234a755721bEc49D1C3DE9E89b667F6eFEed4916', tokens: ['OPEN', 'WETH'] },
    { name: 'PENDLE_WETH_NORMAL', address: '0x629bFc81d8f5f56cB068ed707cde27f91aE30Be8', tokens: ['PENDLE', 'WETH'] },
    { name: 'ARB_USDCe_NORMAL', address: '0x01E413E4b4a0F676aeB05358f7c1a3974d3dF6CE', tokens: ['ARB', 'USDCe'] },
    { name: 'WETH_GMX_EXOTIC', address: '0x4614D575E0249C2E1e5aCb93Bfa11963A1a54b06', tokens: ['WETH', 'GMX'] },
];

const positionManager = '0x0b95Ea9Eb46716d20991163AE60eD2e16645Ef38';
const openToWethPriceRate = '0x7F0d91eB166A39063a7C15dB1f153D693Bb8bf7a';

const totalTokenAbi = 'function totalToken() view returns (uint256)';
const getValueFarmAbi = 'function getFarmValue(address) view returns (address, uint256, address, uint256)';
const openToWethPriceRateAbi = 'function getPrice(address, address) view returns (uint256, uint256)';



async function openWorldExports({ api }) {
    const balances = {};
    const chain = 'arbitrum';

    await tvlOfVaults(api, balances, chain);
    await tvlOfFarms(api, balances, chain);

    return balances;
}

async function tvlOfVaults(api, balances, chain) {
    for (const vault of vaults) {
        let totalToken = await api.call({
            target: vault.address,
            abi: totalTokenAbi
        });

        if (vault.token === 'OPEN') {
            totalToken = await convertOpenToWeth(api, vault.address, totalToken);
            sdk.util.sumSingleBalance(balances, tokenAddresses.WETH, totalToken, chain);
        } else {
            sdk.util.sumSingleBalance(balances, tokenAddresses[vault.token], totalToken, chain);
        }
    }
}

async function tvlOfFarms(api, balances, chain) {
    for (const farm of farms) {
        const valueFarm = await api.call({
            target: positionManager,
            params: farm.address,
            abi: getValueFarmAbi
        });

        let [token0, amount0, token1, amount1] = valueFarm;

        [token0, amount0] = await handleTokenOPEN(api, farm.address, token0, amount0);
        [token1, amount1] = await handleTokenOPEN(api, farm.address, token1, amount1);

        sdk.util.sumSingleBalance(balances, token0, amount0, chain);
        sdk.util.sumSingleBalance(balances, token1, amount1, chain);
    }
}

async function convertOpenToWeth(api, address, amount) {
    const openToWethConversionRate = await getOpenToWethConversionRate(api);
    return (amount * openToWethConversionRate) / 1e18;
}

async function handleTokenOPEN(api, address, token, amount) {
    if (token === tokenAddresses.OPEN) {
        amount = await convertOpenToWeth(api, address, amount);
        token = tokenAddresses.WETH;
    }
    return [token, amount];
}

async function getOpenToWethConversionRate(api) {
    const rate = await api.call({
        target: openToWethPriceRate,
        params: [tokenAddresses.OPEN, tokenAddresses.WETH],
        abi: openToWethPriceRateAbi
    });
    const [price, ] = rate;
    return price;
}

module.exports = {
    openWorldExports,
};