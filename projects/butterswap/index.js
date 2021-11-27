const sdk = require("@defillama/sdk");
const {calculateUniTvl} = require("../helper/calculateUniTvl");

//HECO ADDRESSES
const hecoFactory = "0x874D01CA682C9c26BA7E6D9f6F801d1a1fb49201";
const hecoButter = "0xbf84214ea409A369774321727595F218889eD943";
const hecoChef = "0x89a3BfA840CF4C9022789CC60500Ec03df8C2935";

//BSC ADDRESSES
const bscFactory = "0x1Ba94C0851D96b2c0a01382Bf895B5b25361CcB2";
const bscButter = "0x5eF7814f4cB17b38408F1F641e4b5b61c5D023a8";
const bscHButter = "0x2f3bca2631fff538b8a55207f6c2081457e229f7";
const bscChef = "0xa49f4CF57eaFE0098D398DF3eD3A7dF10EAaBfAB";

async function hecoTvl(timestamp, block, chainBlocks) {
    return await calculateUniTvl(addr=>{
        if (addr.toLowerCase() === "0x5545153ccfca01fbd7dd11c0b23ba694d9509a6f") {
            return "0x6f259637dcd74c767781e37bc6133cd6a68aa161"
        }
        else if (addr.toLowerCase() === "0xdd86dd2dc0aca2a8f41a680fc1f88ec1b7fc9b09"){
            return "0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce";
        }
        else if (addr.toLowerCase() === "0x311bcb634a4111e6516d3899f9fbfbfe984f021a") {
            return "0xb2e260f12406c401874ecc960893c0f74cd6afcd"
        }
        else if (addr.toLowerCase() === "0xdb11743fe8b129b49b11236e8a715004bdabe7e5") {
            return "0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0"
        }
        else if (addr.toLowerCase() === "0x40280e26a572745b1152a54d1d44f365daa51618") {
            return "bsc:0xba2ae424d960c26247dd6c32edc70b295c744c43"
        }
        else if (addr.toLowerCase() === "0x4f99d10e16972ff2fe315eee53a95fc5a5870ce3") {
            return "bsc:0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c"
        }
        return `heco:${addr}`
    }, chainBlocks.heco, "heco", hecoFactory, 0, true);
}

async function bscTvl(timestamp, block, chainBlocks) {
    return await calculateUniTvl(addr=>{
        addr = addr.toLowerCase();
        if (addr === "0x2f3bca2631fff538b8a55207f6c2081457e229f7" || addr === "0x5ef7814f4cb17b38408f1f641e4b5b61c5d023a8") {
            return "heco:0xbf84214ea409a369774321727595f218889ed943"
        }
        return `bsc:${addr}`
    }, chainBlocks.bsc, "bsc", bscFactory, 0, true);
}

async function bscStaking(timestamp, block, chainBlocks) {
    let balances = {};
    let stakingBalance = (await sdk.api.erc20.balanceOf({
        target: bscButter,
        owner: bscChef,
        block: chainBlocks.bsc,
        chain: "bsc"
    })).output;
    sdk.util.sumSingleBalance(balances, `heco:${hecoButter}`, stakingBalance);
    return balances;
}

async function hecoStaking(timestamp, block, chainBlocks) {
    let balances = {};
    let stakingBalance = (await sdk.api.erc20.balanceOf({
        target: hecoButter,
        owner: hecoChef,
        block: chainBlocks.heco,
        chain: "heco"
    })).output;
    sdk.util.sumSingleBalance(balances, `heco:${hecoButter}`, stakingBalance);
    return balances;
}



module.exports = {
    heco: {
        tvl: hecoTvl,
        staking: hecoStaking
    },
    bsc: {
        tvl: bscTvl,
        staking: bscStaking
    },
    tvl: sdk.util.sumChainTvls([hecoTvl, bscTvl])
}