const { sumTokens2 } = require('../helper/unwrapLPs');
const { siloTvl, aaveTvl, eulerTvl, pendleTvl, beetsTvl, penpieTvl } = require('./helpers');

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

async function tvl(api) {
    const { get } = require('../helper/http');
    const response = await get('https://api.zyf.ai/api/v1/data/active-wallets?chainId=146');
    const owners = response;
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
}

module.exports = {
    methodology: 'Counts the TVL of all smart wallet accounts deployed by ZyFAI protocol across multiple DeFi protocols',
    sonic: {
        tvl,
    }
}