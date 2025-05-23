const { sumTokens2 } = require('../helper/unwrapLPs');

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

const eulerPoolAddresses =      {
    'MEV Capital Sonic Cluster USDC.e': '0x196F3C7443E940911EE2Bb88e019Fd71400349D9',
    'Re7 Labs Cluster USDC.e': '0x3D9e5462A940684073EED7e4a13d19AE0Dcd13bc',
};

const BEETS_POOL_ADDRESSES = {
    'aUSDC-wstkscUSD-scUSD': {
        deposit: '0x54Ca9aad90324C022bBeD0A94b7380c03aA5884A',
        stake: '0x724a6716bf9CA384584bEb51a2eA07564c7fdD69'
    }
};

const PENPIE_MARKET_ADDRESSES = {
    'LP-aUSDC': '0x3f5ea53d1160177445b1898afbb16da111182418',
};
const PENPIE_CONTRACT = '0x7A89614B596720D4D0f51A69D6C1d55dB97E9aAB';

async function siloTvl(api, owners) {
    const siloVaults = Object.values(siloPoolAddresses);
    let totalUsdValue = 0;

    // Get asset addresses for all vaults in one batch
    const assetAddresses = await api.multiCall({ 
        abi: 'function asset() view returns (address)',
        calls: siloVaults.map(vault => ({ target: vault }))
    });
    // Get decimals for all assets in one batch
    const decimalsList = await api.multiCall({ 
        abi: 'erc20:decimals', 
        calls: assetAddresses.map(asset => ({ target: asset }))
    });
    // Create maps for easy lookup
    const decimalsMap = {};
    siloVaults.forEach((vault, i) => {
        decimalsMap[vault.toLowerCase()] = decimalsList[i];
    });
    // Prepare all balanceOf calls for all owners and vaults
    const balanceCalls = [];
    siloVaults.forEach(vault => {
        owners.forEach(owner => {
            balanceCalls.push({ target: vault, params: [owner] });
        });
    });
    // Batch fetch all balances
    const balances = await api.multiCall({ 
        abi: 'erc20:balanceOf', 
        calls: balanceCalls 
    });
    // Batch fetch all convertToAssets calls only for non-zero balances
    const convertToAssetsCalls = balances
        .map((balance, i) => balance > 0 ? {
            target: balanceCalls[i].target,
            params: [balance],
            index: i // Keep track of original index
        } : null)
        .filter(call => call !== null);

    const assets = await api.multiCall({ 
        abi: 'function convertToAssets(uint256) view returns (uint256)', 
        calls: convertToAssetsCalls 
    });

    // Calculate USD value for each asset and sum
    for (let i = 0; i < assets.length; i++) {
        const originalIndex = convertToAssetsCalls[i].index;
        const vault = balanceCalls[originalIndex].target.toLowerCase();
        const decimals = decimalsMap[vault];
        const usdValue = Number(assets[i]) / (10 ** decimals);
        totalUsdValue += usdValue;
    }
    return totalUsdValue;
}

async function aaveTvl(api, owners) {
    const AAVE_TOKEN_ADDRESS = '0x578Ee1ca3a8E1b54554Da1Bf7C583506C4CD11c6';
    // Get all balances in one batch
    const balanceCalls = owners.map(owner => ({ target: AAVE_TOKEN_ADDRESS, params: [owner] }));
    const balances = await api.multiCall({ abi: 'erc20:balanceOf', calls: balanceCalls });
    // AAVE token is USDC (6 decimals)
    const decimals = 6;
    let total = 0;
    for (let i = 0; i < balances.length; i++) {
        total += Number(balances[i]) / (10 ** decimals);
    }
    return total;
}

async function eulerTvl(api, owners) {
    const eulerPools = Object.values(eulerPoolAddresses);
    let totalUsdValue = 0;
    // Get decimals for each pool (once per pool)
    const decimalsList = await api.multiCall({
        abi: 'erc20:decimals',
        calls: eulerPools.map(pool => ({ target: pool }))
    });
    const decimalsMap = {};
    eulerPools.forEach((pool, i) => {
        decimalsMap[pool.toLowerCase()] = decimalsList[i];
    });
    // Prepare all balanceOf calls for all owners and pools
    const balanceCalls = [];
    eulerPools.forEach(pool => {
        owners.forEach(owner => {
            balanceCalls.push({ target: pool, params: [owner] });
        });
    });
    // Batch fetch all balances
    const balances = await api.multiCall({
        abi: 'erc20:balanceOf',
        calls: balanceCalls
    });
    // Batch fetch all convertToAssets calls
    const convertToAssetsCalls = balances.map((balance, i) => ({
        target: balanceCalls[i].target,
        params: [balance],
    }));
    const assets = await api.multiCall({
        abi: 'function convertToAssets(uint256) view returns (uint256)',
        calls: convertToAssetsCalls
    });
    // Calculate USD value for each asset and sum
    for (let i = 0; i < assets.length; i++) {
        const pool = balanceCalls[i].target.toLowerCase();
        const decimals = decimalsMap[pool];
        const usdValue = Number(assets[i]) / (10 ** decimals);
        totalUsdValue += usdValue;
    }
    return totalUsdValue;
}

async function pendleTvl(api, owners) {
    // Use the full pendleMarketAddresses object for all token types
    const marketAddresses = pendleMarketAddresses;
    // Gather all token addresses
    const allTokens = [];
    for (const market of Object.values(marketAddresses)) {
        for (const address of Object.values(market)) {
            allTokens.push(address.toLowerCase());
        }
    }
    // Fetch prices for all tokens in one batch
    const priceApiUrl = `https://api-v2.pendle.finance/core/v1/146/assets/prices?addresses=${allTokens.join(",")}&skip=0`;
    const priceResponse = await fetch(priceApiUrl);
    const priceData = await priceResponse.json();
    const prices = priceData.prices || {};
    // Prepare all balanceOf calls for all owners and all tokens
    const balanceCalls = [];
    for (const token of allTokens) {
        for (const owner of owners) {
            balanceCalls.push({ target: token, params: [owner] });
        }
    }
    // Batch fetch all balances
    const balances = await api.multiCall({
        abi: 'erc20:balanceOf',
        calls: balanceCalls
    });
    // Sum USD value for all balances
    let totalUsdValue = 0;
    for (let i = 0; i < balances.length; i++) {
        const token = balanceCalls[i].target.toLowerCase();
        const price = prices[token] || 0;
        const usdValue = (Number(balances[i]) * price) / 1e18;
        totalUsdValue += usdValue;
    }
    return totalUsdValue;
}

async function beetsTvl(api, owners) {
    const pool = BEETS_POOL_ADDRESSES['aUSDC-wstkscUSD-scUSD'];
    const calls = [];
    owners.forEach(owner => {
        calls.push({ target: pool.deposit, params: [owner] });
        calls.push({ target: pool.stake, params: [owner] });
    });
    // Batch fetch all balances
    const balances = await api.multiCall({
        abi: 'erc20:balanceOf',
        calls
    });
    // Sum all balances (18 decimals)
    let total = 0;
    for (let i = 0; i < balances.length; i++) {
        total += Number(balances[i]) / 1e18;
    }
    api.add(pool.deposit, total);
    return total;
}

async function penpieTvl(api, owners) {
    // Only one market in this example, but can be extended
    const marketAddress = PENPIE_MARKET_ADDRESSES['LP-aUSDC'];
    // Prepare all Penpie balance calls for all owners
    const balanceCalls = owners.map(owner => ({ target: PENPIE_CONTRACT, params: [marketAddress, owner] }));
    // Batch fetch all balances
    const balances = await api.multiCall({
        abi: 'function balance(address,address) view returns (uint256)',
        calls: balanceCalls
    });
    // Fetch price for the LP token
    const priceApiUrl = `https://api-v2.pendle.finance/core/v1/146/assets/prices?addresses=${marketAddress}&skip=0`;
    const priceResponse = await fetch(priceApiUrl);
    const priceData = await priceResponse.json();
    const price = priceData?.prices?.[marketAddress] || 0;
    // Sum USD value for all balances
    let totalUsdValue = 0;
    for (let i = 0; i < balances.length; i++) {
        let usdValue = (Number(balances[i]) * price) / 1e18;
        if (usdValue < 1) usdValue = parseFloat(usdValue.toFixed(6));
        totalUsdValue += usdValue;
    }
    return totalUsdValue;
}

async function tvl(api) {
    const response = await fetch('https://api.zyf.ai/api/v1/data/active-wallets?chainId=146');
    const owners = await response.json()
    owners.push(
        '0xb50685c25485CA8C520F5286Bbbf1d3F216D6989',
        '0x952835d17AC55825F198a68DAb2823cD60C8e6bd',
        '0xd61C43c089852e0AB68B967dD1eDe03a18e52223'
    );
    console.log('owners', owners.length)
    const siloUsd = await siloTvl(api, owners);
    const aaveUsd = await aaveTvl(api, owners);
    const pendleUsd = await pendleTvl(api, owners);
    const eulerUsd = await eulerTvl(api, owners);
    const beetsUsd = await beetsTvl(api, owners);
    const penpieUsd = await penpieTvl(api, owners);
    console.log('siloUsd', siloUsd);
    console.log('aaveUsd', aaveUsd);
    console.log('pendleUsd', pendleUsd);
    console.log('eulerUsd', eulerUsd);
    console.log('beetsUsd', beetsUsd);
    console.log('penpieUsd', penpieUsd);
    const totalUsd = 
        siloUsd + 
        aaveUsd + 
        pendleUsd +
        eulerUsd +
        beetsUsd +
        penpieUsd +
        0;
    return { 'usd': totalUsd };

    // const tokens = []
    // tokens.push(...Object.values(siloPoolAddresses))
    // console.log('siloPoolAddresses', siloPoolAddresses)
    // console.log('tokens', tokens)
    // await sumTokens2({api, tokens, owners })

}

module.exports = {
    methodology: 'Counts the TVL of all smart wallet accounts deployed by ZyFAI protocol across multiple DeFi protocols',
    sonic: {
        tvl,
    }
}