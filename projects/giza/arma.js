const { getConfig } = require('../helper/cache');
const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokensLowValue } = require('../helper/cache/lowValue');

// Base chain protocol addresses
const BASE_PROTOCOLS = {
    aavePoolDataProvider: '0xd82a47fdebB5bf5329b09441C3DaB4b5df2153Ad', // Aave V3 Pool Data Provider
    tokens: [
        "0xf42f5795D9ac7e9D757dB633D693cD548Cfd9169", // FLUID USDC
        "0xb125E6687d4313864e53df431d5425969c15Eb2F", // COMPOUND USDC
        "0xEdc817A28E8B93B03976FBd4a3dDBc9f7D176c22", // MOONWELL USDC
        "0xc1256Ae5FF1cf2719D4937adb3bbCCab2E00A2Ca", // MORPHO MOONWELL FLAGSHIP USDC
        "0xbeeF010f9cb27031ad51e3333f9aF9C6B1228183", // MORPHO STEAKHOUSE USDC
        "0xBEEFE94c8aD530842bfE7d8B397938fFc1cb83b2", // MORPHO STEAKHOUSE PRIME USDC
        "0xeE8F4eC5672F09119b96Ab6fB59C27E1b7e44b61", // MORPHO GAUNTLET USDC PRIME
        "0x616a4E1db48e22028f6bbf20444Cd3b8e3273738", // MORPHO SEAMLESS USDC
        "0x0A1a3b5f2041F33522C4efc754a7D096f880eE16", // Euler: usdc
        "0x23479229e52Ab6aaD312D0B03DF9F33B46753B5e", // MORPHO EXTRAFI USDC
        "0x7BfA7C4f149E7415b73bdeDfe609237e29CBF34A", // MORPHO SPARK USDC
    ]
};

// Plasma chain protocol addresses  
const PLASMA_PROTOCOLS = {
    aavePoolDataProvider: '0xf2D6E38B407e31E7E7e4a16E6769728b76c7419F', // Aave V3 Pool Data Provider
    tokens: [
        "0x1DD4b13fcAE900C60a350589BE8052959D2Ed27B", // FLUID USDT0
        "0xB0004aD99F0e383cC413bA69ACff7c229D930112", // Euler Frontier ETHENA USDT0
    ]
};

// Arbitrum chain protocol addresses
const ARBITRUM_PROTOCOLS = {
    aavePoolDataProvider: '0x6b4E260b765B3cA1514e618C0215A6B7839fF93e', // Aave V3 Pool Data Provider
    tokens: [
        "0x9c4ec768c28520B50860ea7a15bd7213a9fF58bf", // Compound USDC
        "0x1A996cb54bb95462040408C06122D45D6Cdb6096", // Fluid USDC
        "0x05d28A86E057364F6ad1a88944297E58Fc6160b3", // Euler Yield USDC
        "0x0a1eCC5Fe8C9be3C809844fcBe615B46A869b899", // Euler USDC
        "0x7e97fa6893871A2751B5fE961978DCCb2c201E65", // Morpho Gauntlet USDC Core
        "0x7c574174DA4b2be3f705c6244B4BfA0815a8B3Ed", // Morpho Gauntlet USDC Prime
        "0x5c0C306Aaa9F877de636f4d5822cA9F2E81563BA", // Morpho Steakhouse High Yield USDC
    ]
};

// Arbitrum chain protocol addresses
const HYPEREVM_PROTOCOLS = {
    hyperlendPoolDataProvider: '0x5481bf8d3946E6A3168640c1D7523eB59F055a29', // Hyperlend Pool Data Provider
    tokens: [
        "0xFc5126377F0efc0041C0969Ef9BA903Ce67d151e", // Morpho Felix USDT0
        "0x53A333e51E96FE288bC9aDd7cdC4B1EAD2CD2FfA", // Morpho Gauntlet USDT0
    ]
};

const abi = {
    getReserveTokensAddresses: "function getReserveTokensAddresses(address asset) view returns (address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress)",
};

async function getMergedOwners(api, chainId) {
    const ownersOldRaw = await getConfig(`giza/arma/${api.chain}`, `https://api.arma.xyz/api/v1/${chainId}/smart-accounts`);
    const ownersNewRaw = await getConfig(`giza/arma/gizatech/${api.chain}`, `https://api.gizatech.xyz/api/v1/${chainId}/smart-accounts`);

    const ownersOld = Array.isArray(ownersOldRaw) ? ownersOldRaw : [];
    const ownersNew = Array.isArray(ownersNewRaw) ? ownersNewRaw : [];

    const owners = [...ownersOld, ...ownersNew]
        .filter(owner => typeof owner === 'string')
        .map(owner => owner.trim().toLowerCase())
        .filter(Boolean);

    return [...new Set(owners)];
}

// Every smart account is checked against every protocol token while most accounts hold next to nothing (tens of
// thousands of accounts on Base). An account worth under $100 is stored with its balances, counted from the store, and
// read again once a week.
function armaTvl({ chainId, dataProvider, asset, tokens }) {
    return async (api) => {
        const owners = await getMergedOwners(api, chainId);

        api.log(`[Arma] Found ${owners.length} smart accounts on ${api.chain}`);

        // aToken of the asset, from the Aave V3 (Hyperlend on HyperEVM) Pool Data Provider
        const reserveData = await api.call({ target: dataProvider, abi: abi.getReserveTokensAddresses, params: [asset] });

        await sumTokensLowValue({ api, project: 'giza', key: `arma-${api.chain}`, owners, tokens: [...tokens, reserveData.aTokenAddress] });
        return api.getBalances();
    };
}

module.exports = {
    base: { tvl: armaTvl({ chainId: 8453, dataProvider: BASE_PROTOCOLS.aavePoolDataProvider, asset: ADDRESSES.base.USDC, tokens: BASE_PROTOCOLS.tokens }) },
    plasma: { tvl: armaTvl({ chainId: 9745, dataProvider: PLASMA_PROTOCOLS.aavePoolDataProvider, asset: ADDRESSES.plasma.USDT0, tokens: PLASMA_PROTOCOLS.tokens }) },
    arbitrum: { tvl: armaTvl({ chainId: 42161, dataProvider: ARBITRUM_PROTOCOLS.aavePoolDataProvider, asset: ADDRESSES.arbitrum.USDC_CIRCLE, tokens: ARBITRUM_PROTOCOLS.tokens }) },
    hyperliquid: { tvl: armaTvl({ chainId: 999, dataProvider: HYPEREVM_PROTOCOLS.hyperlendPoolDataProvider, asset: ADDRESSES.hyperliquid.USDT0, tokens: HYPEREVM_PROTOCOLS.tokens }) },
};
