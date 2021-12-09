
/*==================================================
  Modules
  ==================================================*/
const BigNumber = require('bignumber.js');
const sdk = require("@defillama/sdk");
const {unwrapUniswapLPs} = require('../helper/unwrapLPs')

const abi = require('./abi');
const registry = require('./registry');
const itoken = require('./itoken');
const masterchef = require('./masterchef');

let iTokens = [
];

let iTokensNew = [];

const tokens = {
    ethereum: {
        'bzrx': '0x56d811088235F11C8920698a204A5010a788f4b3',
        'lp': '0xa30911e072A0C88D55B5D0A0984B66b0D04569d0',
        'vbzrx': '0xB72B31907C1C95F3650b64b2469e08EdACeE5e8F',
        'pool3': '0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490',
    },
    polygon: {
        'bzrx': '0x54cFe73f2c7d0c4b62Ab869B473F5512Dc0944D2',
        'gov': '0xd5d84e75f48E75f01fb2EB6dFD8eA148eE3d0FEb',
        'lp': '0xC698b8a1391F88F497A4EF169cA85b492860b502'

    },
    bsc: {
        'bzrx': '0x4b87642AEDF10b642BE4663Db842Ecc5A88bf5ba',
        'gov': '0xf8E026dC4C0860771f691EcFFBbdfe2fa51c77CF',
        'lp': '0xAcCeD00820C2F4Ce8c8a6Ad5Ace32dc15B06e961'
    }
}

const contracts = {
    ethereum: {
        'bzx': '0xD8Ee69652E4e4838f2531732a46d1f7F584F0b7f',
        'registry': '0xf0E474592B455579Fe580D610b846BdBb529C6F7',
        'bzrx': '0x56d811088235F11C8920698a204A5010a788f4b3',
        'staking': '0xe95Ebce2B02Ee07dEF5Ed6B53289801F7Fc137A4',
        'sushi_masterchef': '0xc2EdaD668740f1aA35E4D8f227fB8E17dcA888Cd'
    },
    polygon: {
        'bzx': '0xfe4F0eb0A1Ad109185c9AaDE64C48ff8e928e54B',
        'registry': '0x5a6f1e81334C63DE0183A4a3864bD5CeC4151c27',
        'masterchef': '0xd39Ff512C3e55373a30E94BB1398651420Ae1D43',
        'bzrx': '0x54cFe73f2c7d0c4b62Ab869B473F5512Dc0944D2'
    },
    bsc: {
        'bzx': '0xc47812857a74425e2039b57891a3dfcf51602d5d',
        'registry': '0x2fA30fB75E08f5533f0CF8EBcbb1445277684E85',
        'masterchef': '0x1FDCA2422668B961E162A8849dc0C2feaDb58915',
        'bzrx': '0x4b87642AEDF10b642BE4663Db842Ecc5A88bf5ba'
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

async function getBalances(timestamp, block, chainBlocks, network) {
    let balances = {};
    const balanceOfCalls = [];
    const getTokensResult = await sdk.api.abi.call({
        block,
        target: contracts[network].registry,
        params: [0, 200],
        chain: network,
        abi: registry["getTokens"]
    });

    getTokensResult.output.forEach((token) =>{
        iTokensNew.push({
          iTokenAddress: token[0],
          underlyingAddress: token[1]
        });

        const target = token[1];
        balanceOfCalls.push({ target: target, params: contracts[network].bzx });
    });

    iTokens = iTokens.concat(iTokensNew);
    const iTokenCalls = iTokens.map((iToken) => ({
        target: iToken.iTokenAddress
    }));

    const supplyResult = await sdk.api.abi.multiCall({
        block,
        calls: iTokenCalls,
        chain: network,
        abi: abi["totalAssetSupply"]
    });

    const borrowResult = await sdk.api.abi.multiCall({
        block,
        calls: iTokenCalls,
        chain: network,
        abi: abi["totalAssetBorrow"]
    });

    iTokens.forEach((iToken) => {
        const supply = supplyResult.output.find((result) => (result.input.target === iToken.iTokenAddress));
        const borrow = borrowResult.output.find((result) => (result.input.target === iToken.iTokenAddress));

        if (supply.success && borrow.success) {
            const totalSupply = supply.output;
            const totalBorrow = borrow.output;
            const token = iToken.underlyingAddress;
            balances[token] = BigNumber(totalSupply).minus(totalBorrow).toFixed();
        }
    });

    //Staking on eth only
    if(contracts[network].staking){
        const calls = [];
        balanceOfCalls.push({ target: tokens[network].pool3, params: contracts[network].bzx });
        balanceOfCalls.push({ target: tokens[network].vbzrx, params: contracts[network].bzx });
        balanceOfCalls.push({ target: tokens[network].lp, params: contracts[network].bzx });
        balanceOfCalls.push({ target: tokens[network].lp_old, params: contracts[network].bzx });
        balanceOfCalls.push({ target: tokens[network].bzrx, params: contracts[network].staking });
        balanceOfCalls.push({ target: tokens[network].vbzrx, params: contracts[network].staking });
        balanceOfCalls.push({ target: tokens[network].lp, params: contracts[network].staking });
        balanceOfCalls.push({ target: tokens[network].lp_old, params: contracts[network].staking });
        balanceOfCalls.push({ target: tokens[network].pool3, params: contracts[network].staking });
        balanceOfCalls.push({ target: tokens[network].bzrx, params: tokens[network].lp });

        const supplyByAsset = await sdk.api.abi.multiCall({
            block,
            calls: calls,
            chain: network,
            abi: abi["totalSupplyByAsset"]
        });

        for(let i = 0; i < calls.length; i++){
            const call = calls[i];
            const token = call.params;
            balances[token] = BigNumber((balances[token]||0)).plus(BigNumber(supplyByAsset.output[i].output)).toFixed();
        }

        if(contracts[network].sushi_masterchef){
            const masterchefSupply = await sdk.api.abi.call({
                block,
                target: contracts[network].sushi_masterchef,
                params: [188, contracts[network].staking],
                chain: network,
                abi: masterchef["userInfo"]
            });
            const token = tokens[network].lp;
            balances[token] = BigNumber((balances[token]||0)).plus(BigNumber(masterchefSupply.output.amount)).toFixed();
        }
    }

    //Farming on bsc and polygon
    if(contracts[network].masterchef){
        const pools = [];
        if(network === 'bsc'){
            pools.push({pid: 7, address: tokens[network].gov});
            pools.push({pid: 9, address: tokens[network].lp});
        }
        else if (network === 'polygon'){
            pools.push({pid: 0, address: tokens[network].gov});
            pools.push({pid: 1, address: tokens[network].lp});
        }
        const calls = [];
        for (const pool of pools) {
             calls.push({ target: contracts[network].masterchef, params: pool.pid });
        }

        const supplyByAsset = await sdk.api.abi.multiCall({
            block,
            calls: calls,
            chain: network,
            abi: masterchef["balanceOf"]
        });

        for(let i = 0; i<pools.length; i++){
            const pool = pools[i];
            const token = pool.address;
            balances[token] = BigNumber((balances[token]||0)).plus(BigNumber(supplyByAsset.output[i].output)).toFixed();
        }
    }

    //Balances
    const balanceOfs = await sdk.api.abi.multiCall({
        block,
        calls: balanceOfCalls,
        chain: network,
        abi: abi["balanceOf"],
    });

    for(let i = 0; i<balanceOfCalls.length; i++){
        const call = balanceOfCalls[i];
        if(call.target){
            const token = call.target;
            balances[token] = BigNumber((balances[token]||0)).plus(BigNumber(balanceOfs.output[i].output)).toFixed();
        }
    }

    //Unwrap lp
    const lps = Object.keys(tokens[network]).filter(key=>key.indexOf('lp')>=0).map(key=>{
        return {
            token: tokens[network][key],
            balance: balances[tokens[network][key]]
        }
    })
    await unwrapUniswapLPs(balances, lps, chainBlocks[network], network)
    lps.forEach(lp=>{
        delete balances[lp.token]
    })

    if(tokens[network].vbzrx){
        //Recalculate vbzrx to bzrx
        const totalVested = await sdk.api.abi.call({
            block,
            target: tokens[network].vbzrx,
            chain: network,
            abi: abi["totalVested"]
        });
        const totalSupply = await sdk.api.abi.call({
            block,
            target: tokens[network].vbzrx,
            chain: network,
            abi: abi["totalSupply"]
        });

        const vbzrxWorthPart = 1 - totalVested.output/totalSupply.output;
        balances[tokens[network].bzrx] = BigNumber(balances[tokens[network].bzrx]||0).plus(
            BigNumber(balances[tokens[network].vbzrx]||0 * vbzrxWorthPart)
        ).toFixed()
        delete balances[tokens[network].vbzrx]

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
  Exports
  ==================================================*/

module.exports = {
    polygon:{
        tvl: polygon
    },
    bsc:{
        tvl: bsc
    },
    ethereum:{
        tvl: eth
    },
};

