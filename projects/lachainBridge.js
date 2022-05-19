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

const contracts_usd = {
    "binance-usd": "0x6571DD15430a455118EC6e24Dc7820489ED7019b",
    "polygon-usd": "0x82E4d5d7F36a22f2FEaaF87eCcDcDA7e0EFc98C3",
    "ethereum-usd": "0xAB49eb8Ca42f42fd7e8b745F2CC5BeDfb78d2D3E",
    "aave-usd": "0x8783256443217856B716464A068aabdecc3F0b95",
    "fantom-usd": "0x73Ec53a1Ee3Ea275D95212b41Dcce8cb9e0206Cd",
    "harmony-usd": "0x5DDDc78C8a59CeD4d25a8FD96BF9D9FdA561D0FF",
}

async function tvl_polygon(timestamp, block, chainBlocks) {
    const supplies_polygon = (await sdk.api.eth.getBalance({ 
        target: contracts['matic-network'], 
        block: chainBlocks.polygon, 
        chain: 'polygon' 
    })).output;

    // console.log("supplies usd polygon:: ", supplies_polygon)

    const supplies_usd_polygon = (await sdk.api.abi.call({
        target: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
        params: contracts_usd['polygon-usd'],
        abi: "erc20:balanceOf",
        block: chainBlocks.polygon,
        chain: 'polygon'
    })).output;

    // console.log("Polygon output:: ", supplies_usd_polygon)

    const supplies_latoken = (await sdk.api.abi.call({
        target: "0x17d09EB02D369Ceef3347d4426ff1b6e46F2aD85",
        params: contracts_usd['polygon-usd'],
        abi: "erc20:balanceOf",
        block: chainBlocks.polygon,
        chain: 'polygon'
    })).output;


    return {[`matic-network`]: supplies_polygon / 10 ** 18, 
            [`tether`]: supplies_usd_polygon / 10**6,
            [`latoken`]: supplies_latoken / 10**18}
};

async function tvl_bsc(timestamp, block, chainBlocks) {
    const supplies_bsc = (await sdk.api.eth.getBalance({ 
        target: contracts['binancecoin'], 
        block: chainBlocks.bsc, 
        chain: 'bsc' 
    })).output;

    // console.log("binancecoin output:: ", supplies_bsc)

    const supplies_usd_bsc = (await sdk.api.abi.call({
        target: "0x55d398326f99059fF775485246999027B3197955",
        params: contracts_usd['binance-usd'],
        abi: "erc20:balanceOf",
        block: chainBlocks.bsc,
        chain: 'bsc'
    })).output;

    const supplies_latoken = (await sdk.api.abi.call({
        target: "0x494aD295ca4b8beC1d89cea200b95062b0dCDD7f",
        params: contracts_usd['binance-usd'],
        abi: "erc20:balanceOf",
        block: chainBlocks.bsc,
        chain: 'bsc'
    })).output;

    // console.log("bsc output:: ", supplies_usd_bsc)
    
    return {[`binancecoin`]: supplies_bsc / 10 ** 18, 
            ['tether']: supplies_usd_bsc / 10**18, 
            ['latoken']: supplies_latoken / 10**18}
};

async function tvl_ethereum(timestamp, block, chainBlocks) {
    const supplies_eth = (await sdk.api.eth.getBalance({ 
        target: contracts['ethereum'], 
        block: chainBlocks.ethereum, 
        chain: 'ethereum' 
    })).output;

    // console.log("ethereum output:: ", supplies_eth)
    
    const supplies_usd_ethereum = (await sdk.api.abi.call({
        target: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
        params: contracts_usd['ethereum-usd'],
        abi: "erc20:balanceOf",
        block: chainBlocks.ethereum,
        chain: 'ethereum'
    })).output;

    const supplies_latoken = (await sdk.api.abi.call({
        target: "0xE50365f5D679CB98a1dd62D6F6e58e59321BcdDf",
        params: contracts_usd['ethereum-usd'],
        abi: "erc20:balanceOf",
        block: chainBlocks.ethereum,
        chain: 'ethereum'
    })).output;

    // console.log("ethereum output:: ", supplies_usd_ethereum)

    return {[`ethereum`]: supplies_eth / 10 ** 18, 
            [`tether`]: supplies_usd_ethereum / 10 ** 6, 
            [`latoken`]: supplies_latoken / 10 ** 18}
};

async function tvl_avax(timestamp, block, chainBlocks) {
    const supplies_aave = (await sdk.api.eth.getBalance({ 
        target: contracts['avalanche-2'], 
        block: chainBlocks.avax, 
        chain: 'avax' 
    })).output;

    // console.log("avalanche-2 output:: ", supplies_aave)
    
    const supplies_usd_aave = (await sdk.api.abi.call({
        target: "0xc7198437980c041c805A1EDcbA50c1Ce5db95118",
        params: contracts_usd['aave-usd'],
        abi: "erc20:balanceOf",
        block: chainBlocks.avax,
        chain: 'avax'
    })).output;

    const supplies_latoken = (await sdk.api.abi.call({
        target: "0x7f1b5d039F873e4B703E2D0a09B4bbcE287BF14a",
        params: contracts_usd['aave-usd'],
        abi: "erc20:balanceOf",
        block: chainBlocks.avax,
        chain: 'avax'
    })).output;


    // console.log("aave output:: ", supplies_usd_aave)

    return {[`avalanche-2`]: supplies_aave / 10 ** 18, 
            [`tether`]: supplies_usd_aave / 10 ** 6,
            [`latoken`]: supplies_latoken / 10 ** 18}
};

async function tvl_fantom(timestamp, block, chainBlocks) {
    const supplies_polygon = (await sdk.api.eth.getBalance({ 
        target: contracts['fantom'], 
        block: chainBlocks.fantom, 
        chain: 'fantom' 
    })).output;

    // console.log("fantom output:: ", supplies_polygon)
    
    const supplies_usd_fantom = (await sdk.api.abi.call({
        target: "0x049d68029688eabf473097a2fc38ef61633a3c7a",
        params: contracts_usd['fantom-usd'],
        abi: "erc20:balanceOf",
        block: chainBlocks.fantom,
        chain: 'fantom'
    })).output;

    const supplies_latoken = (await sdk.api.abi.call({
        target: "0x998De69785e60D953700D6293b53540539f6991e",
        params: contracts_usd['fantom-usd'],
        abi: "erc20:balanceOf",
        block: chainBlocks.fantom,
        chain: 'fantom'
    })).output;

    return {[`fantom`]: supplies_polygon / 10 ** 18,
            [`tether`]: supplies_usd_fantom / 10 ** 6,
            [`latoken`]: supplies_latoken / 10 ** 18}
};

async function tvl_harmony(timestamp, block, chainBlocks) {
    const supplies_polygon = (await sdk.api.eth.getBalance({ 
        target: contracts['harmony'], 
        block: chainBlocks.harmony, 
        chain: 'harmony' 
    })).output;

    // console.log("harmony output:: ", supplies_polygon)

    const supplies_usd_harmony = (await sdk.api.abi.call({
        target: "0x3c2b8be99c50593081eaa2a724f0b8285f5aba8f",
        params: contracts_usd['harmony-usd'],
        abi: "erc20:balanceOf",
        block: chainBlocks.harmony,
        chain: 'harmony'
    })).output;

    const supplies_latoken = (await sdk.api.abi.call({
        target: "0xdcfc88276e0ae400956fb9ba92641d37c00073a5",
        params: contracts_usd['harmony-usd'],
        abi: "erc20:balanceOf",
        block: chainBlocks.harmony,
        chain: 'harmony'
    })).output;
    
    return {[`harmony`]: supplies_polygon / 10 ** 18,
            [`tether`]: supplies_usd_harmony / 10 ** 6,
            [`latoken`]: supplies_latoken / 10 ** 18}
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
