const { get } = require('../helper/http');

// ---- Protocol Addresses ----
const SILO_POOL_ADDRESSES = {
    'S-USDC-20': '0x322e1d5384aa4ED66AeCa770B95686271de61dc3',
    'S-USDC-8': '0x4E216C15697C1392fE59e1014B009505E05810Df',
    'wstkscUSD-USDC-23': '0x5954ce6671d97D24B782920ddCdBB4b1E63aB2De',
    'Anon-USDC-27': '0x7e88AE5E50474A48deA4c42a634aA7485e7CaA62',
    'x33-USDC-49': '0xa18a8f100f2c976044f2f84fae1eE9f807Ae7893',
    'PT-wstkscUSD (29 May)-USDC-34': '0x6030aD53d90ec2fB67F3805794dBB3Fa5FD6Eb64',
    'wstkscUSD-USDC-55': '0x4935FaDB17df859667Cc4F7bfE6a8cB24f86F8d0',
    'Varlamore USDC Growth': '0xF6F87073cF8929C206A77b0694619DC776F89885',
    'Re7 scUSD': '0x592D1e187729C76EfacC6dfFB9355bd7BF47B2a7',
};
const AAVE_TOKEN_ADDRESS = '0x578Ee1ca3a8E1b54554Da1Bf7C583506C4CD11c6';
const EULER_POOL_ADDRESSES = {
    'MEV Capital Sonic Cluster USDC.e': '0x196F3C7443E940911EE2Bb88e019Fd71400349D9',
    'Re7 Labs Cluster USDC.e': '0x3D9e5462A940684073EED7e4a13d19AE0Dcd13bc',
};
const PENDLE_MARKET_ADDRESSES = {
    aUSDC: {
        lp: '0x3f5ea53d1160177445b1898afbb16da111182418',
        pt: '0x930441aa7ab17654df5663781ca0c02cc17e6643',
        yt: '0x18d2d54f42ba720851bae861b98a0f4b079e6027',
        sy: '0xc4a9d8b486f388cc0e4168d2904277e8c8372fa3',
    },
    scUSD: {
        lp: '0x84ecc6be573f15991736131f924f7bf571ed3b60',
        pt: '0x9731842ed581816913933c01de142c7ee412a8c8',
        yt: '0x3ab07241db5e87e45edca012ddf4bde84c078920',
        sy: '0x068def65b9dbaff02b4ee54572a9fa7dfb188ea3',
    },
};
const BEETS_POOL = {
    deposit: '0x54Ca9aad90324C022bBeD0A94b7380c03aA5884A',
    stake: '0x724a6716bf9CA384584bEb51a2eA07564c7fdD69',
};
const PENPIE_MARKET_ADDRESS = '0x3f5ea53d1160177445b1898afbb16da111182418';
const PENPIE_CONTRACT = '0x7A89614B596720D4D0f51A69D6C1d55dB97E9aAB';

/**
 * Utility to batch fetch decimals for a list of tokens.
 */
async function getDecimalsMap(api, tokens) {
    const decimalsList = await api.multiCall({
        abi: 'erc20:decimals',
        calls: tokens.map(token => ({ target: token })),
    });
    const map = {};
    tokens.forEach((token, i) => {
        map[token.toLowerCase()] = decimalsList[i];
    });
    return map;
}

/**
 * Silo TVL (fix: use asset decimals, not vault decimals)
 */
async function siloTvl(api, owners) {
    const siloVaults = Object.values(SILO_POOL_ADDRESSES);
    const assetAddresses = await api.multiCall({
        abi: 'function asset() view returns (address)',
        calls: siloVaults.map(vault => ({ target: vault })),
    });
    // Map vault address to asset address
    const vaultToAsset = {};
    siloVaults.forEach((vault, i) => {
        vaultToAsset[vault.toLowerCase()] = assetAddresses[i].toLowerCase();
    });
    // Fetch decimals for asset addresses
    const decimalsMap = await getDecimalsMap(api, assetAddresses);
    // Prepare all balanceOf calls for all owners and vaults
    const balanceCalls = siloVaults.flatMap(vault => owners.map(owner => ({ target: vault, params: [owner] })));
    const balances = await api.multiCall({
        abi: 'erc20:balanceOf',
        calls: balanceCalls,
    });
    // Only call convertToAssets for non-zero balances
    const convertToAssetsCalls = balances
        .map((balance, i) => balance > 0 ? {
            target: balanceCalls[i].target,
            params: [balance],
            index: i,
        } : null)
        .filter(Boolean);
    const assets = await api.multiCall({
        abi: 'function convertToAssets(uint256) view returns (uint256)',
        calls: convertToAssetsCalls,
    });
    // Calculate USD value for each asset and sum
    let totalUsdValue = 0;
    for (let i = 0; i < assets.length; i++) {
        const originalIndex = convertToAssetsCalls[i].index;
        const vault = balanceCalls[originalIndex].target.toLowerCase();
        const asset = vaultToAsset[vault];
        const decimals = decimalsMap[asset] || 18;
        totalUsdValue += Number(assets[i]) / (10 ** decimals);
    }
    return totalUsdValue;
}

/**
 * Aave TVL
 */
async function aaveTvl(api, owners) {
    const balanceCalls = owners.map(owner => ({ target: AAVE_TOKEN_ADDRESS, params: [owner] }));
    const balances = await api.multiCall({ abi: 'erc20:balanceOf', calls: balanceCalls });
    const decimals = 6;
    return balances.reduce((sum, bal) => sum + Number(bal) / (10 ** decimals), 0);
}

/**
 * Euler TVL (fix: use correct decimals mapping)
 */
async function eulerTvl(api, owners) {
    const eulerPools = Object.values(EULER_POOL_ADDRESSES);
    // Map pool address to itself for clarity (could be extended if needed)
    const poolToAsset = {};
    eulerPools.forEach(pool => {
        poolToAsset[pool.toLowerCase()] = pool.toLowerCase();
    });
    const decimalsMap = await getDecimalsMap(api, eulerPools);
    const balanceCalls = eulerPools.flatMap(pool => owners.map(owner => ({ target: pool, params: [owner] })));
    const balances = await api.multiCall({
        abi: 'erc20:balanceOf',
        calls: balanceCalls,
    });
    const convertToAssetsCalls = balances.map((balance, i) => ({
        target: balanceCalls[i].target,
        params: [balance],
    }));
    const assets = await api.multiCall({
        abi: 'function convertToAssets(uint256) view returns (uint256)',
        calls: convertToAssetsCalls,
    });
    let totalUsdValue = 0;
    for (let i = 0; i < assets.length; i++) {
        const pool = balanceCalls[i].target.toLowerCase();
        const asset = poolToAsset[pool];
        const decimals = decimalsMap[asset] || 18;
        totalUsdValue += Number(assets[i]) / (10 ** decimals);
    }
    return totalUsdValue;
}

/**
 * Pendle TVL
 */
async function pendleTvl(api, owners) {
    // Gather all token addresses
    const allTokens = Object.values(PENDLE_MARKET_ADDRESSES).flatMap(market => Object.values(market).map(addr => addr.toLowerCase()));
    // Fetch prices for all tokens in one batch
    const priceApiUrl = `https://api-v2.pendle.finance/core/v1/146/assets/prices?addresses=${allTokens.join(",")}&skip=0`;
    const priceData = await get(priceApiUrl);
    const prices = priceData.prices || {};
    // Prepare all balanceOf calls for all owners and all tokens
    const balanceCalls = allTokens.flatMap(token => owners.map(owner => ({ target: token, params: [owner] })));
    const balances = await api.multiCall({
        abi: 'erc20:balanceOf',
        calls: balanceCalls,
    });
    // Sum USD value for all balances
    return balances.reduce((sum, bal, i) => {
        const token = balanceCalls[i].target.toLowerCase();
        const price = prices[token] || 0;
        return sum + (Number(bal) * price) / 1e18;
    }, 0);
}

/**
 * Beets TVL
 */
async function beetsTvl(api, owners) {
    const calls = owners.flatMap(owner => [
        { target: BEETS_POOL.deposit, params: [owner] },
        { target: BEETS_POOL.stake, params: [owner] },
    ]);
    const balances = await api.multiCall({
        abi: 'erc20:balanceOf',
        calls,
    });
    const total = balances.reduce((sum, bal) => sum + Number(bal) / 1e18, 0);
    api.add(BEETS_POOL.deposit, total);
    return total;
}

/**
 * Penpie TVL
 */
async function penpieTvl(api, owners) {
    const balanceCalls = owners.map(owner => ({ target: PENPIE_CONTRACT, params: [PENPIE_MARKET_ADDRESS, owner] }));
    const balances = await api.multiCall({
        abi: 'function balance(address,address) view returns (uint256)',
        calls: balanceCalls,
    });
    const priceApiUrl = `https://api-v2.pendle.finance/core/v1/146/assets/prices?addresses=${PENPIE_MARKET_ADDRESS}&skip=0`;
    const priceData = await get(priceApiUrl);
    const price = priceData?.prices?.[PENPIE_MARKET_ADDRESS] || 0;
    return balances.reduce((sum, bal) => {
        let usdValue = (Number(bal) * price) / 1e18;
        if (usdValue < 1) usdValue = parseFloat(usdValue.toFixed(6));
        return sum + usdValue;
    }, 0);
}

module.exports = {
    siloTvl,
    aaveTvl,
    eulerTvl,
    pendleTvl,
    beetsTvl,
    penpieTvl,
}; 