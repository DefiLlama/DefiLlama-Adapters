const { get } = require('../helper/http');

// Silo TVL
async function siloTvl(api, owners) {
    const siloPoolAddresses = {
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
    const siloVaults = Object.values(siloPoolAddresses);
    let totalUsdValue = 0;
    const assetAddresses = await api.multiCall({ 
        abi: 'function asset() view returns (address)',
        calls: siloVaults.map(vault => ({ target: vault }))
    });
    const decimalsList = await api.multiCall({ 
        abi: 'erc20:decimals', 
        calls: assetAddresses.map(asset => ({ target: asset }))
    });
    const decimalsMap = {};
    siloVaults.forEach((vault, i) => {
        decimalsMap[vault.toLowerCase()] = decimalsList[i];
    });
    const balanceCalls = [];
    siloVaults.forEach(vault => {
        owners.forEach(owner => {
            balanceCalls.push({ target: vault, params: [owner] });
        });
    });
    const balances = await api.multiCall({ 
        abi: 'erc20:balanceOf', 
        calls: balanceCalls 
    });
    const convertToAssetsCalls = balances
        .map((balance, i) => balance > 0 ? {
            target: balanceCalls[i].target,
            params: [balance],
            index: i
        } : null)
        .filter(call => call !== null);
    const assets = await api.multiCall({ 
        abi: 'function convertToAssets(uint256) view returns (uint256)', 
        calls: convertToAssetsCalls 
    });
    for (let i = 0; i < assets.length; i++) {
        const originalIndex = convertToAssetsCalls[i].index;
        const vault = balanceCalls[originalIndex].target.toLowerCase();
        const decimals = decimalsMap[vault];
        const usdValue = Number(assets[i]) / (10 ** decimals);
        totalUsdValue += usdValue;
    }
    return totalUsdValue;
}

// Aave TVL
async function aaveTvl(api, owners) {
    const AAVE_TOKEN_ADDRESS = '0x578Ee1ca3a8E1b54554Da1Bf7C583506C4CD11c6';
    const balanceCalls = owners.map(owner => ({ target: AAVE_TOKEN_ADDRESS, params: [owner] }));
    const balances = await api.multiCall({ abi: 'erc20:balanceOf', calls: balanceCalls });
    const decimals = 6;
    let total = 0;
    for (let i = 0; i < balances.length; i++) {
        total += Number(balances[i]) / (10 ** decimals);
    }
    return total;
}

// Euler TVL
async function eulerTvl(api, owners) {
    const eulerPoolAddresses = {
        'MEV Capital Sonic Cluster USDC.e': '0x196F3C7443E940911EE2Bb88e019Fd71400349D9',
        'Re7 Labs Cluster USDC.e': '0x3D9e5462A940684073EED7e4a13d19AE0Dcd13bc',
    };
    const eulerPools = Object.values(eulerPoolAddresses);
    let totalUsdValue = 0;
    const decimalsList = await api.multiCall({
        abi: 'erc20:decimals',
        calls: eulerPools.map(pool => ({ target: pool }))
    });
    const decimalsMap = {};
    eulerPools.forEach((pool, i) => {
        decimalsMap[pool.toLowerCase()] = decimalsList[i];
    });
    const balanceCalls = [];
    eulerPools.forEach(pool => {
        owners.forEach(owner => {
            balanceCalls.push({ target: pool, params: [owner] });
        });
    });
    const balances = await api.multiCall({
        abi: 'erc20:balanceOf',
        calls: balanceCalls
    });
    const convertToAssetsCalls = balances.map((balance, i) => ({
        target: balanceCalls[i].target,
        params: [balance],
    }));
    const assets = await api.multiCall({
        abi: 'function convertToAssets(uint256) view returns (uint256)',
        calls: convertToAssetsCalls
    });
    for (let i = 0; i < assets.length; i++) {
        const pool = balanceCalls[i].target.toLowerCase();
        const decimals = decimalsMap[pool];
        const usdValue = Number(assets[i]) / (10 ** decimals);
        totalUsdValue += usdValue;
    }
    return totalUsdValue;
}

// Pendle TVL
async function pendleTvl(api, owners) {
    const pendleMarketAddresses = {
        aUSDC: {
            lp: '0x3f5ea53d1160177445b1898afbb16da111182418',
            pt: '0x930441aa7ab17654df5663781ca0c02cc17e6643',
            yt: '0x18d2d54f42ba720851bae861b98a0f4b079e6027',
            sy: '0xc4a9d8b486f388cc0e4168d2904277e8c8372fa3'
        },
        scUSD: {
            lp: '0x84ecc6be573f15991736131f924f7bf571ed3b60',
            pt: '0x9731842ed581816913933c01de142c7ee412a8c8',
            yt: '0x3ab07241db5e87e45edca012ddf4bde84c078920',
            sy: '0x068def65b9dbaff02b4ee54572a9fa7dfb188ea3'
        }
    };
    const marketAddresses = pendleMarketAddresses;
    const allTokens = [];
    for (const market of Object.values(marketAddresses)) {
        for (const address of Object.values(market)) {
            allTokens.push(address.toLowerCase());
        }
    }
    const priceApiUrl = `https://api-v2.pendle.finance/core/v1/146/assets/prices?addresses=${allTokens.join(",")}&skip=0`;
    const priceData = await get(priceApiUrl);
    const prices = priceData.prices || {};
    const balanceCalls = [];
    for (const token of allTokens) {
        for (const owner of owners) {
            balanceCalls.push({ target: token, params: [owner] });
        }
    }
    const balances = await api.multiCall({
        abi: 'erc20:balanceOf',
        calls: balanceCalls
    });
    let totalUsdValue = 0;
    for (let i = 0; i < balances.length; i++) {
        const token = balanceCalls[i].target.toLowerCase();
        const price = prices[token] || 0;
        const usdValue = (Number(balances[i]) * price) / 1e18;
        totalUsdValue += usdValue;
    }
    return totalUsdValue;
}

// Beets TVL
async function beetsTvl(api, owners) {
    const pool = {
        deposit: '0x54Ca9aad90324C022bBeD0A94b7380c03aA5884A',
        stake: '0x724a6716bf9CA384584bEb51a2eA07564c7fdD69'
    };
    const calls = [];
    owners.forEach(owner => {
        calls.push({ target: pool.deposit, params: [owner] });
        calls.push({ target: pool.stake, params: [owner] });
    });
    const balances = await api.multiCall({
        abi: 'erc20:balanceOf',
        calls
    });
    let total = 0;
    for (let i = 0; i < balances.length; i++) {
        total += Number(balances[i]) / 1e18;
    }
    api.add(pool.deposit, total);
    return total;
}

// Penpie TVL
async function penpieTvl(api, owners) {
    const marketAddress = '0x3f5ea53d1160177445b1898afbb16da111182418';
    const PENPIE_CONTRACT = '0x7A89614B596720D4D0f51A69D6C1d55dB97E9aAB';
    const balanceCalls = owners.map(owner => ({ target: PENPIE_CONTRACT, params: [marketAddress, owner] }));
    const balances = await api.multiCall({
        abi: 'function balance(address,address) view returns (uint256)',
        calls: balanceCalls
    });
    const priceApiUrl = `https://api-v2.pendle.finance/core/v1/146/assets/prices?addresses=${marketAddress}&skip=0`;
    const priceData = await get(priceApiUrl);
    const price = priceData?.prices?.[marketAddress] || 0;
    let totalUsdValue = 0;
    for (let i = 0; i < balances.length; i++) {
        let usdValue = (Number(balances[i]) * price) / 1e18;
        if (usdValue < 1) usdValue = parseFloat(usdValue.toFixed(6));
        totalUsdValue += usdValue;
    }
    return totalUsdValue;
}

module.exports = {
    siloTvl,
    aaveTvl,
    eulerTvl,
    pendleTvl,
    beetsTvl,
    penpieTvl,
}; 