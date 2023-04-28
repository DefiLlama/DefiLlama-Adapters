
/*==================================================
Modules
==================================================*/
const BigNumber = require('bignumber.js');
const sdk = require("@defillama/sdk");
const { stakings } = require("../helper/staking");

const abi = require('./abi');
const registry = require('./registry');

let iTokens = [];

let iTokensNew = [];

const tokens = { 
    ethereum: { 
        'bzrx': '0x56d811088235F11C8920698a204A5010a788f4b3',
        'ooki': '0x0De05F6447ab4D22c8827449EE4bA2D5C288379B',
    },
    polygon: {
        'bzrx': '0x54cFe73f2c7d0c4b62Ab869B473F5512Dc0944D2',
        'ooki': '0xCd150B1F528F326f5194c012f32Eb30135C7C2c9',
    },
    bsc: {
        'ooki': '0xa5a6817ac4c164F27df3254B71fE83904B1C3c3e',
    },
    arbitrum: {
        'ooki': '0x400F3ff129Bc9C9d239a567EaF5158f1850c65a4',
    },
    optimism: {
    }
}

const contracts = {
    ethereum: {
        'protocol': '0xD8Ee69652E4e4838f2531732a46d1f7F584F0b7f',
        'registry': '0xf0E474592B455579Fe580D610b846BdBb529C6F7',
    },
    polygon: {
        'protocol': '0x059D60a9CEfBc70b9Ea9FFBb9a041581B1dFA6a8',
        'registry': '0x4B234781Af34E9fD756C27a47675cbba19DC8765',
    },
    bsc: {
        'protocol': '0xD154eE4982b83a87b0649E5a7DDA1514812aFE1f',
        'registry': '0x1BE70f29D30bB1D325E5D76Ee73109de3e50A57d',
    },
    arbitrum: {
        'protocol': '0x37407F3178ffE07a6cF5C847F8f680FEcf319FAB',
        'registry': '0x86003099131d83944d826F8016E09CC678789A30',
    },
    optimism: {
        'protocol': '0xAcedbFd5Bc1fb0dDC948579d4195616c05E74Fd1',
        'registry': '0x22a2208EeEDeb1E2156370Fd1c1c081355c68f2B',
    }
}

/*==================================================
Main
==================================================*/
async function eth(timestamp, block, chainBlocks) {
return getBalances(timestamp, block, chainBlocks, 'ethereum')
}

async function bsc(timestamp, block, chainBlocks) {
return getBalances(timestamp, block, chainBlocks, 'bsc')
}

async function polygon(timestamp, block, chainBlocks) {
return getBalances(timestamp, block, chainBlocks, 'polygon')
}

async function optimism(timestamp, block, chainBlocks) {
return getBalances(timestamp, block, chainBlocks, 'optimism')
}

async function arbitrum(timestamp, block, chainBlocks) {
return getBalances(timestamp, block, chainBlocks, 'arbitrum')
}

async function getBalances(timestamp, block, chainBlocks, network) {
    let balances = {};
    const balanceOfCalls = [];
    const getTokensResult = await sdk.api.abi.call({
        chainBlocks,
        target: contracts[network].registry,
        params: [0, 200],
        chain: network,
        abi: registry.getTokens
    });

    getTokensResult.output.forEach((token) =>{
        iTokensNew.push({
            iTokenAddress: token[0],
            underlyingAddress: token[1]
        });

        const target = token[1];
        balanceOfCalls.push({ target: target, params: contracts[network].protocol });
    });

    iTokens = iTokens.concat(iTokensNew);
    const iTokenCalls = iTokens.map((iToken) => ({
        target: iToken.iTokenAddress
    }));

    const supplyResult = await sdk.api.abi.multiCall({
        chainBlocks,
        calls: iTokenCalls,
               chain: network,
               permitFailure: true,
        abi: abi.totalAssetSupply
    });

    const borrowResult = await sdk.api.abi.multiCall({
        chainBlocks,
        calls: iTokenCalls,
               chain: network,
               permitFailure: true,
        abi: abi.totalAssetBorrow
    });

    iTokens.forEach((iToken) => {
        const supply = supplyResult.output.find((result) => (result.input.target === iToken.iTokenAddress));
        const borrow = borrowResult.output.find((result) => (result.input.target === iToken.iTokenAddress));

        const totalSupply = (supply && supply.success)?supply.output:0;
        const totalBorrow = (borrow && borrow.success)?borrow.output:0;

        if (totalSupply > totalBorrow) {
            const token = iToken.underlyingAddress;
            balances[token] = BigNumber(totalSupply).minus(totalBorrow).toFixed();
        }
    });


    //Balances
    const balanceOfs = await sdk.api.abi.multiCall({
        chainBlocks,
        calls: balanceOfCalls,
        chain: network,
        abi: abi["balanceOf"],
    });

    for(let i = 0; i<balanceOfCalls.length; i++){
        const call = balanceOfCalls[i];
        if(call.target){
            const token = call.target;
            const value = BigNumber((balances[token]||0)).plus(BigNumber(balanceOfs.output[i].output)).toFixed();
            if(value)
                balances[token] = value
            }
    }

    const keys = Object.keys(balances);
    keys.forEach(key=>{
        balances[remap(key, network)] = balances[key];
        delete balances[key]
    })


    return balances;
}

function remap(token, network){
    if(token === tokens[network].bzrx){
        token = 'ethereum:'+tokens['ethereum'].bzrx;
    }
    else{
        token = network+':'+token;
    }
    return token
}

/*==================================================
Staking and Treasury
==================================================*/

let ooki = '0x0De05F6447ab4D22c8827449EE4bA2D5C288379B'
let bzrx = '0x56d811088235F11C8920698a204A5010a788f4b3'
const treasuryContract = '0xfedC4dD5247B93feb41e899A09C44cFaBec29Cbc'

let stakingContracts = [
    '0xe95Ebce2B02Ee07dEF5Ed6B53289801F7Fc137A4',
    '0x16f179f5c344cc29672a58ea327a26f64b941a63'  
]

let TreasureTokens = [ 
    '0x56d811088235F11C8920698a204A5010a788f4b3', //bzrx
    '0x0De05F6447ab4D22c8827449EE4bA2D5C288379B', //ooki
    //'vbzrx': '0xB72B31907C1C95F3650b64b2469e08EdACeE5e8F', vesting tokens not counted
    '0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490', //pool3
]

let ookistaking = stakings(stakingContracts, ooki, 'ethereum')
let bzrxstaking = stakings(stakingContracts, bzrx, 'ethereum')

module.exports = {
    ethereum:{
        tvl: eth,
        staking: sdk.util.sumChainTvls([ookistaking,bzrxstaking]),
    },
    polygon:{
        tvl: polygon
    },
    bsc:{
        tvl: bsc
    },
    arbitrum:{
        tvl: arbitrum
    },
    optimism:{
        tvl: optimism
    },
};

