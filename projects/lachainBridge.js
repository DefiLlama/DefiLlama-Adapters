const sdk = require("@defillama/sdk");

const contracts = {
    "matic-network": "0xE372D290F83c7487bdc925ddA187671bfF9e347b",
    "binancecoin": "0xC926f267418d69147c88Edf88e93E78F2153f923",
    "ethereum": "0xc7fc91a0a93d570738b2af6efb1595c3183809d7",
    "avalanche-2": "0xD4aE8F772dcf2e20b103c740AfD9D9f9E78dbfFC",
    "fantom": "0x012cebA65fD071473a9E0d3C5048702734a1eE5e",
    "arbitrum": "0xD4aE8F772dcf2e20b103c740AfD9D9f9E78dbfFC",
    "harmony": "0x0A19afbE4519A40Df3b48BE46EDc0720724B4A6B",
}

const contracts_lachain = {
    "wUSDT": "0x32D2b9bBCf25525b8D7E92CBAB14Ca1a5f347B14",
    "latoken": "0x3a898D596840C6B6b586d722bFAdCC8c4761BF41",
    "amUSDT": "0x38E1280725EeAa6208a4f1Aa6DbDccc3bf788070",
    "avUSDT": "0x15551e9C0322204e2701D6FD2A7ef45A91428656",
    "aUSDT": "0x0A0eBc20a1540c4029CaF455ba80495EC250C951",
}

async function tvl_polygon(timestamp, block, chainBlocks) {
    const supplies_polygon = (await sdk.api.eth.getBalance({ 
        target: contracts['matic-network'], 
        block: chainBlocks.polygon, 
        chain: 'polygon' 
    })).output;

    console.log("Polygon output:: ", supplies_polygon)
    
    return {[`matic-network`]: supplies_polygon / 10 ** 18}
};

async function tvl_bsc(timestamp, block, chainBlocks) {
    const supplies_polygon = (await sdk.api.eth.getBalance({ 
        target: contracts['binancecoin'], 
        block: chainBlocks.bsc, 
        chain: 'bsc' 
    })).output;

    console.log("binancecoin output:: ", supplies_polygon)
    
    return {[`binancecoin`]: supplies_polygon / 10 ** 18}
};

async function tvl_ethereum(timestamp, block, chainBlocks) {
    const supplies_polygon = (await sdk.api.eth.getBalance({ 
        target: contracts['ethereum'], 
        block: chainBlocks.ethereum, 
        chain: 'ethereum' 
    })).output;

    console.log("ethereum output:: ", supplies_polygon)
    
    return {[`ethereum`]: supplies_polygon / 10 ** 18}
};

async function tvl_avax(timestamp, block, chainBlocks) {
    const supplies_polygon = (await sdk.api.eth.getBalance({ 
        target: contracts['avalanche-2'], 
        block: chainBlocks.avax, 
        chain: 'avax' 
    })).output;

    console.log("avalanche-2 output:: ", supplies_polygon)
    
    return {[`avalanche-2`]: supplies_polygon / 10 ** 18}
};

async function tvl_fantom(timestamp, block, chainBlocks) {
    const supplies_polygon = (await sdk.api.eth.getBalance({ 
        target: contracts['fantom'], 
        block: chainBlocks.fantom, 
        chain: 'fantom' 
    })).output;

    console.log("fantom output:: ", supplies_polygon)
    
    return {[`fantom`]: supplies_polygon / 10 ** 18}
};

async function tvl_harmony(timestamp, block, chainBlocks) {
    const supplies_polygon = (await sdk.api.eth.getBalance({ 
        target: contracts['harmony'], 
        block: chainBlocks.harmony, 
        chain: 'harmony' 
    })).output;

    console.log("harmony output:: ", supplies_polygon)
    
    return {[`harmony`]: supplies_polygon / 10 ** 18}
};

async function tvl_lachain(timestamp, block, chainBlocks) {

    const balances = {};

    const supplies = (await sdk.api.abi.multiCall({
        calls: Object.values(contracts_lachain).map((c) => ({
            target: c
        })),
        abi: "erc20:totalSupply",
        block: chainBlocks.lachain,
        chain: 'lachain'
    })).output;

    // console.log("lachain supplies:: ", supplies)

    const decimals = (await sdk.api.abi.multiCall({
        calls: Object.values(contracts_lachain).map((c) => ({
            target: c
        })),
        abi: "erc20:decimals",
        block: chainBlocks.lachain,
        chain: 'lachain'
    })).output;

    // console.log("lachain decimals:: ", decimals)

    for (let i = 0; i < Object.keys(contracts_lachain).length; i++) {
        
        if(Object.keys(contracts_lachain)[i].includes("USDT")){
            sdk.util.sumSingleBalance(
                balances, 
                "tether", 
                supplies[i].output / 10 ** decimals[i].output
            );
        }
        else{
            sdk.util.sumSingleBalance(
                balances, 
                Object.keys(contracts_lachain)[i], 
                supplies[i].output / 10 ** decimals[i].output
                );
        }
    };

    // console.log("balances:: ", balances)

    return balances;
};

module.exports = {
    polygon: {
        tvl: tvl_polygon
    },
    bsc: {
        tvl: tvl_bsc
    },
    ethereum: {
        tvl: tvl_ethereum
    },
    avalanche: {
        tvl: tvl_avax
    },
    fantom: {
        tvl: tvl_fantom   
    },
    harmony: {
        tvl : tvl_harmony
    },
    lachain: {
        tvl: tvl_lachain
    }
};