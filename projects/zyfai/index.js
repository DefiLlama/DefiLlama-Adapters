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
    'stS-USDC-36': '0x11Ba70c0EBAB7946Ac84F0E6d79162b0cBb2693f',
    'EGGS-USDC-33': '0x42CE2234fd5a26bF161477a996961c4d01F466a3',
    'WBTC-USDC-50': '0xb488af9A423eE9012db3b90B213dcca2CD9C4070'
};

const eulerPoolAddresses =      {
    'MEV Capital Sonic Cluster USDC.e': '0x196F3C7443E940911EE2Bb88e019Fd71400349D9',
    'Re7 Labs Cluster USDC.e': '0x3D9e5462A940684073EED7e4a13d19AE0Dcd13bc',
};

async function tvl(api) {
    const response = await fetch('https://api.zyf.ai/api/v1/data/active-wallets?chainId=146');
    const owners = await response.json();

    // Aave TVL 
    const tokens = ['0x578Ee1ca3a8E1b54554Da1Bf7C583506C4CD11c6']

    // Pendle TVL 
    Object.values(pendleMarketAddresses).map(market => tokens.push(...Object.values(market)))

    // Silo TVL 
    tokens.push(...Object.values(siloPoolAddresses))

    // euler TVL 
    tokens.push(...Object.values(eulerPoolAddresses))

    await sumTokens2({api, tokens, owners })
}

module.exports = {
    methodology: 'Counts the TVL of all smart wallet accounts deployed by ZyFAI protocol across multiple DeFi protocols',
    sonic: {
        tvl,
    }
}