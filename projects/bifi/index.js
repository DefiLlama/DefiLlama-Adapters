const sdk = require("@defillama/sdk");
const { staking } = require("../helper/staking");
const Caver = require('caver-js');
const OracleAbi = require('./abi/oracle.json');
const TokenAbi = require('./abi/token.json');

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
    },
    'wbtc': {
        'pool': '0x93948Aa8488F522d5b079AF84fe411FBCE476e9f',
        'token': '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599'
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
    },
    'busd': {
        'pool': '0x829ED2a2BeF8b72e648f92CBF01587C7E12e8c1e',
        'token': '0xe9e7cea3dedca5984780bafc599bd69add087d56'
    }
}

const avaxPool = '0x446881360d6d39779D292662fca9BC85C5789dB3'
const avaxTokenPools = {
    'eth': {
        'pool': '0x8AbA88E8A4AB28319b782199cB17f0001EE67984',
        'token': '0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB'
    },
    'usdt': {
        'pool': '0xE893233515b7D02dD4e3D888162d4C87Dc837943',
        'token': '0xc7198437980c041c805A1EDcbA50c1Ce5db95118'
    },
    'usdc': {
        'pool': '0x8385Ea36dD4BDC84B3F2ac718C332E18C1E42d36',
        'token': '0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664'
    }
}

const klayOracleContract = '0xCD4F7C7451FFD8628b7F3D5c1b68a3A207ab1125';
const klayPool = '0x829fCFb6A6EeA9d14eb4C14FaC5B29874BdBaD13';
const klaytnTokenPools = {
    'keth': {
        'pool': '0x07970F9D979D8594B394fE12345211C376aDfF89',
        'token': '0x34d21b1e550d73cee41151c77f3c73359527a396'
    },
    'kusdt': {
        'pool': '0xe0e67b991d6b5CF73d8A17A10c3DE74616C1ec11',
        'token': '0xcee8faf64bb97a73bb51e115aa89c17ffa8dd167'
    },
    'kusdt': {
        'pool': '0xe0e67b991d6b5CF73d8A17A10c3DE74616C1ec11',
        'token': '0xcee8faf64bb97a73bb51e115aa89c17ffa8dd167'
    },
    'kdai': {
        'pool': '0xE03487927e137526a2dB796A9B3b4048ab615043',
        'token': '0x5c74070fdea071359b86082bd9f9b3deaafbe32b'
    },
    'usdc': {
        'pool': '0x808c707c53c3D30d0247e4b8D78AA0D8b75CAAE1',
        'token': '0x754288077d0ff82af7a5317c7cb8c444d421d103'
    },
    'kwbtc': {
        'pool': '0xa6aDE2e6c6F50a2d9b9C4b819e84b367F88C1598',
        'token': '0x16d0e1fbd024c600ca0380a4c5d57ee7a2ecbf9c'
    },
    'kxrp': {
        'pool': '0x4800577A71F68eD7ef4C09cFBe7fd6E066D5F0dA',
        'token': '0x9eaefb09fe4aabfbe6b1ca316a3c36afc83a393f'
    },
}

function getAVAXAddress(address) {
    return `avax:${address}`
}

function getBSCAddress(address) {
    return `bsc:${address}`
}

const coinAddress = '0x0000000000000000000000000000000000000000'

async function eth(timestamp, block) {
    let balances = {};

    const ethBlock = block

    // eth
    balances[coinAddress] = (await sdk.api.eth.getBalance({
        target: ethPool,
        block: ethBlock
    })).output

    // eth tokens
    sdk.util.sumMultiBalanceOf(balances, await sdk.api.abi.multiCall({
        abi: 'erc20:balanceOf',
        block: ethBlock,
        calls: Object.values(ethTokenPools).map(tokenPool=>({
            params: tokenPool.pool,
            target: tokenPool.token,
        }))
    }), true)

    return balances
}

const wbtc = "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599"
async function bitcoin(timestamp, ethBlock) {
    const tokenPool = {
        'pool': '0x986Eb51E67e154901ff9B482835788B8f3054076',
        'token': '0x4ca7a5Fb41660A9c5c31683B832A17f7f7457344'
    }
    let tokenLocked = await sdk.api.erc20.balanceOf({
        owner: tokenPool.pool,
        target: tokenPool.token,
        block: ethBlock
    });
    return {
        [wbtc]: tokenLocked.output
    }
}

const wbnb = "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c"
async function bsc(timestamp, block, chainBlocks) {
    let balances = {};

    const bscBlock = chainBlocks.bsc
    // bsc
    balances[getBSCAddress(wbnb)] = ((await sdk.api.eth.getBalance({
        target: bscPool,
        chain: 'bsc',
        block: bscBlock
    })).output)

    // bsc tokens
    sdk.util.sumMultiBalanceOf(balances, await sdk.api.abi.multiCall({
        abi: 'erc20:balanceOf',
        block: bscBlock,
        chain: 'bsc',
        calls: Object.values(bscTokenPools).map(tokenPool=>({
            params: tokenPool.pool,
            target: tokenPool.token,
        }))
    }), true, getBSCAddress)

    return balances
}

const wavax = "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7"
async function avax(timestamp, block, chainBlocks) {
    let balances = {};

    const avaxBlock = chainBlocks.avax
    // avax
    balances[getAVAXAddress(wavax)] = ((await sdk.api.eth.getBalance({
        target: avaxPool,
        chain: 'avax',
        block: avaxBlock
    })).output)

    // avax tokens
    for (token in avaxTokenPools) {
        tokenPool = avaxTokenPools[token];
        let tokenLocked = await sdk.api.erc20.balanceOf({
            owner: tokenPool.pool,
            target: tokenPool.token,
            chain: 'avax',
            block: avaxBlock
        });

          sdk.util.sumSingleBalance(balances, getAVAXAddress(tokenPool.token), tokenLocked.output);
    }

    return balances
}

async function klaytn() {
    const provider = new Caver.providers.HttpProvider("https://cypress.chain.thebifrost.io/");
    const caver = new Caver(provider);
    let klaytnTVL = 0;

    const oracleContract = new caver.klay.Contract(OracleAbi, klayOracleContract);

    const klayPrice = await oracleContract.methods.getTokenPrice(0).call();
    const klayBalance = await caver.rpc.klay.getBalance(klayPool);

    klaytnTVL += klayPrice * klayBalance / (10 ** 36);

    let oracleID = 0
    for (token in klaytnTokenPools) {
        oracleID += 1;

        const tokenAddress = klaytnTokenPools[token].token;
        const tokenPoolAddress = klaytnTokenPools[token].pool;

        const tokenPrice = await oracleContract.methods.getTokenPrice(oracleID).call();

        const tokenContract = new caver.klay.Contract(TokenAbi, tokenAddress);
        const balance = await tokenContract.methods.balanceOf(tokenPoolAddress).call();
        const decimals = await tokenContract.methods.decimals().call();

        const div = 18 + parseInt(decimals, 10);

        klaytnTVL += balance * tokenPrice / 10 ** div;
    }

    console.log(klaytnTVL);
    return klaytnTVL;
}

module.exports = {
    ethereum: {
        tvl: eth,
        staking: staking(stakingPool, bfcAddr)
    },
    bsc: {
        tvl: bsc
    },
    bitcoin:{
        tvl: bitcoin
    },
    avax: {
        tvl: avax
    },
    klaytn: {
        tvl: klaytn
    }
}