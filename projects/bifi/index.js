const sdk = require("@defillama/sdk");

const stakingPool = '0x488933457E89656D7eF7E69C10F2f80C7acA19b5';
const bfcAddr = '0x0c7D5ae016f806603CB1782bEa29AC69471CAb9c';

const ethPool = '0x13000c4a215efe7e414bb329b2f11c39bcf92d78';
const ethTokenPools = {
    'usdt': {
        'pool': '0x808c3ba97268dbf9695b1ec10729e09c7e67a9e3',
        'token': '0xdac17f958d2ee523a2206206994597c13d831ec7'
    },
    'dai': {
        'pool': '0xd76b7060f1b646fa14740ff6ac670a4f0a6fc5e3',
        'token': '0x6b175474e89094c44da98b954eedeac495271d0f'
    },
    'link': {
        'pool': '0x25567603eb61a4a49f27e433652b5b8940d10682',
        'token': '0x514910771af9ca656af840dff83e8264ecf986ca'
    },
    'usdc': {
        'pool': '0x128647690C7733593aA3Dd149EeBC5e256E79217',
        'token': '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
    }
}


const bscPool = '0x170b6AA872166eC2F8515c2B855C34B6C7563c18'
const bscTokenPools = {
    'usdt': {
        'pool': '0x2A29598cbc17BA112C8Fd0E07Fbf5402eF57E6b8',
        'token': '0x55d398326f99059ff775485246999027b3197955'
    },
    'dai': {
        'pool': '0xB67C5433d234d656002f12664d15ab4b40666D9B',
        'token': '0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3'
    },
    'eth': {
        'pool': '0xf86d8218BCC15874f5D25c191FdDd43F2334c3EB',
        'token': '0x2170ed0880ac9a755fd29b2688956bd959f933f8'
    },
    'usdc': {
        'pool': '0xBA9De5a8FD91408826616f2d6d7470A11E34c9F0',
        'token': '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d'
    },
    'btcb': {
        'pool': '0x26d0E4707af1c1DAAd8e9BA21b99cDa7Fd24c40B',
        'token': '0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c'
    }
}

function getBSCAddress(address) {
    return `bsc:${address}`
}

async function tvl(timestamp, block) {
    let balances = {};

    const ethBlock = await sdk.api.util.lookupBlock(timestamp, {
        chain: 'ethereum'
    }).output

    const bscBlock = await sdk.api.util.lookupBlock(timestamp, {
        chain: 'bsc'
    }).output

    const coinAddress = '0x0000000000000000000000000000000000000000'
    // eth
    balances[coinAddress] = (await sdk.api.eth.getBalance({
        target: ethPool,
        ethBlock
    })).output

    // staking pool
    let tokenStaked = await sdk.api.erc20.balanceOf({
        owner: stakingPool,
        target: bfcAddr,
        ethBlock
      });
      sdk.util.sumSingleBalance(balances, bfcAddr, tokenStaked.output);

    // eth tokens
    for (token in ethTokenPools) {
        tokenPool = ethTokenPools[token];
        let tokenLocked = await sdk.api.erc20.balanceOf({
            owner: tokenPool.pool,
            target: tokenPool.token,
            ethBlock
          });
          sdk.util.sumSingleBalance(balances, tokenPool.token, tokenLocked.output);
    }

    // bsc
    balances[getBSCAddress(coinAddress)] = ((await sdk.api.eth.getBalance({
        target: bscPool,
        chain: 'bsc',
        bscBlock
    })).output)

    // bsc tokens
    for (token in bscTokenPools) {
        tokenPool = bscTokenPools[token];
        let tokenLocked = await sdk.api.erc20.balanceOf({
            owner: tokenPool.pool,
            target: tokenPool.token,
            chain: 'bsc',
            bscBlock
          });
          sdk.util.sumSingleBalance(balances, getBSCAddress(tokenPool.token), tokenLocked.output);
    }


    return balances

}

module.exports = {
  tvl
}