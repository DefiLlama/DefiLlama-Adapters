const { get } = require('../helper/http')

// Protocol-specific TVL calculations
async function pendleTvl(api, wallets) {
    const marketAddresses = {
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
    
    // Get prices for all market addresses
    const prices = {};
    for (const market of Object.keys(marketAddresses)) {
        for (const [type, address] of Object.entries(marketAddresses[market])) {
            const priceResponse = await get(`https://api-v2.pendle.finance/core/v1/146/assets/prices?addresses=${address.toLowerCase()}&skip=0`);
            const price = priceResponse.prices[address.toLowerCase()];
            if (price === undefined) {
                console.log(`Warning: No price found for ${market} ${type} address ${address}`)
                continue;
            }
            prices[`${market}_${type}`] = price;
        }
    }

    // Process each wallet
    for (const wallet of wallets) {
        console.log('Calculating Pendle TVL for Wallet:', wallet)
        
        // Get balance for each token
        for (const market of Object.keys(marketAddresses)) {
            for (const [type, address] of Object.entries(marketAddresses[market])) {
                const balance = await api.call({
                    abi: 'erc20:balanceOf',
                    target: address,
                    params: [wallet]
                });
                const usdValue = (Number(balance) * prices[`${market}_${type}`]) / 1e18;
                if (usdValue > 0.01) {
                    api.add(address, usdValue);
                }
            }
        }
    }
}

async function aaveTvl(api, wallets) {
    const AAVE_TOKEN_ADDRESS = '0x578Ee1ca3a8E1b54554Da1Bf7C583506C4CD11c6';
    
    for (const wallet of wallets) {
        console.log('Calculating Aave TVL for Wallet:', wallet);
        const balance = await api.call({
            abi: 'erc20:balanceOf',
            target: AAVE_TOKEN_ADDRESS,
            params: [wallet]
        });
        const usdValue = Number(balance) / 1e6; // 6 decimals for Aave token
        if (usdValue > 0.01) {
            api.add(AAVE_TOKEN_ADDRESS, usdValue);
        }
    }
}

async function siloTvl(api, wallets) {
    const POOL_ADDRESSES = {
        'S-USDC-20': '0x322e1d5384aa4ED66AeCa770B95686271de61dc3',
        'S-USDC-8': '0x4E216C15697C1392fE59e1014B009505E05810Df',
        'wstkscUSD-USDC-23': '0x5954ce6671d97D24B782920ddCdBB4b1E63aB2De',
        'Anon-USDC-27': '0x7e88AE5E50474A48deA4c42a634aA7485e7CaA62',
        'x33-USDC-49': '0xa18a8f100f2c976044f2f84fae1eE9f807Ae7893',
        'PT-wstkscUSD (29 May)-USDC-34': '0x6030aD53d90ec2fB67F3805794dBB3Fa5FD6Eb64',
        'stS-USDC-36': '0x11Ba70c0EBAB7946Ac84F0E6d79162b0cBb2693f',
        'EGGS-USDC-33': '0x42CE2234fd5a26bF161477a996961c4d01F466a3',
        'WBTC-USDC-50': '0xb488af9A423eE9012db3b90B213dcca2CD9C4070'
    };

    for (const wallet of wallets) {
        console.log('Calculating Silo TVL for Wallet:', wallet);
        
        for (const [poolName, address] of Object.entries(POOL_ADDRESSES)) {
            const balance = await api.call({
                abi: 'erc20:balanceOf',
                target: address,
                params: [wallet]
            });

            const assets = await api.call({
                abi: 'function convertToAssets(uint256) view returns (uint256)',
                target: address,
                params: [balance]
            });

            const decimals = await api.call({
                abi: 'erc20:decimals',
                target: address
            });

            const usdValue = Number(assets) / (10 ** decimals);
            if (usdValue > 0.01) {
                api.add(address, usdValue);
            }
        }
    }
}

async function eulerTvl(api, wallets) {
    const POOL_ADDRESSES = {
        'MEV Capital Sonic Cluster USDC.e': '0x196F3C7443E940911EE2Bb88e019Fd71400349D9',
        'Re7 Labs Cluster USDC.e': '0x3D9e5462A940684073EED7e4a13d19AE0Dcd13bc',
    };

    for (const wallet of wallets) {
        console.log('Calculating Euler TVL for Wallet:', wallet);
        
        for (const [poolName, address] of Object.entries(POOL_ADDRESSES)) {
            const balance = await api.call({
                abi: 'erc20:balanceOf',
                target: address,
                params: [wallet]
            });

            const assets = await api.call({
                abi: 'function convertToAssets(uint256) view returns (uint256)',
                target: address,
                params: [balance]
            });

            const decimals = await api.call({
                abi: 'erc20:decimals',
                target: address
            });

            const usdValue = Number(assets) / (10 ** decimals);
            if (usdValue > 0.01) {
                api.add(address, usdValue);
            }
        }
    }
}



async function tvl(api) {
    const response = await fetch('https://api.zyf.ai/api/v1/data/active-wallets?chainId=146');
    const wallets = await response.json();
    
    // Calculate TVL for each protocol
    await Promise.all([
        pendleTvl(api, wallets),
        aaveTvl(api, wallets),
        siloTvl(api, wallets),
        eulerTvl(api, wallets),
    ]);    

    // Calculate total TVL
    const balances = api.getBalances();
    const totalTvl = Object.values(balances).reduce((sum, value) => sum + value, 0);
    console.log('Total TVL:', totalTvl);
    
    return { 'usd-coin': totalTvl };
}

module.exports = {
    methodology: 'Counts the TVL of all smart wallet accounts deployed by ZyFAI protocol across multiple DeFi protocols',
    sonic: {
        tvl,
    }
}