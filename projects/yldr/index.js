const { abi } = require('./abi');
const { unwrapUniswapV3NFTs } = require("../helper/unwrapLPs");

const UI_POOL_DATA_PROVIDERS = { "ethereum": '0x6Ab39f4e9F494733893Ca90212558e55C7196012', "arbitrum": '0x775f2616557824bbcf2ea619cA2BacaBd930F2BD' };
const ADDRESSES_PROVIDERS = { "ethereum": '0x16085E000eAC286aa503326cBcEe4564268a7F8f', "arbitrum": '0x66d2eaD9cbE6754985a9Be7B829502228Ef8b49B' };
const ERC1155_UNISWAP_V3_WRAPPER = { "ethereum": '0x13f4dc963ddd2ec0160f6473c69b704b0e8674fc', "arbitrum": '0x07B99965dBEdf38322ADFe48623e042Aa0656283' };

function stripTokenHeader(token) {
    return token.indexOf(':') > -1 ? token.split(':')[1] : token
}

async function borrowed(_, _1, _2, { api }) {
    const uiPoolDataProviderAddress = UI_POOL_DATA_PROVIDERS[api.chain];
    const addressesProviderAddress = ADDRESSES_PROVIDERS[api.chain];

    const reservesData = await api.call({
        abi: abi,
        target: uiPoolDataProviderAddress,
        params: [addressesProviderAddress],
    });
    reservesData.reservesData.forEach(reserveData => {
        api.add(reserveData.underlyingAsset, reserveData.totalScaledVariableDebt);
    });
}

async function tvl(_, _1, _2, { api }) {
    const uiPoolDataProviderAddress = UI_POOL_DATA_PROVIDERS[api.chain];
    const addressesProviderAddress = ADDRESSES_PROVIDERS[api.chain];
    const erc1155UniswapV3Wrapper = ERC1155_UNISWAP_V3_WRAPPER[api.chain];

    const reservesData = await api.call({
        abi: abi,
        target: uiPoolDataProviderAddress,
        params: [addressesProviderAddress],
    });
    reservesData.reservesData.forEach(reserveData => {
        api.add(reserveData.underlyingAsset, reserveData.availableLiquidity);
    });

    let balances = await unwrapUniswapV3NFTs({ owner: erc1155UniswapV3Wrapper, chain: api.chain, block: api.block, });
    Object.entries(balances).forEach(balance => {
        api.add(stripTokenHeader(balance[0]), balance[1]);
    });
}

module.exports = {
    timetravel: true,
    misrepresentedTokens: false,
    methodology: 'Get available liquidity for all reserves and include Uniswap V3 positions',
    start: 1702931986,
    ethereum: { tvl, borrowed },
    arbitrum: { tvl, borrowed }
}; 