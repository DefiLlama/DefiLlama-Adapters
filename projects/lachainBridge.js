const sdk = require("@defillama/sdk");

const contracts = {
    "matic-network": "0xE372D290F83c7487bdc925ddA187671bfF9e347b",
    "binancecoin": "0xC926f267418d69147c88Edf88e93E78F2153f923",
    "ethereum": "0xc7fc91a0a93d570738b2af6efb1595c3183809d7",
    "avalanche-2": "0xD4aE8F772dcf2e20b103c740AfD9D9f9E78dbfFC",
    "fantom": "0x012cebA65fD071473a9E0d3C5048702734a1eE5e",
    "arbitrum": "0xD4aE8F772dcf2e20b103c740AfD9D9f9E78dbfFC",
    "harmony": "0x0A19afbE4519A40Df3b48BE46EDc0720724B4A6B"
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
    }
};