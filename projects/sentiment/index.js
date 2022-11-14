const sdk = require("@defillama/sdk")
const {getBlock} = require("../helper/getBlock")

async function tvl(timestamp, ethBlock, chainBlocks){
    const chain = "arbitrum"
    const block = await getBlock(timestamp, chain, chainBlocks, true)
    const tokens = (await sdk.api.abi.call({
        block, chain,
        target: "0x17b07cfbab33c0024040e7c299f8048f4a49679b",
        abi: {"inputs":[],"name":"getAllLTokens","outputs":[{"internalType":"address[]","name":"","type":"address[]"}],"stateMutability":"view","type":"function"}
    })).output
    const assets = (await sdk.api.abi.multiCall({
        block, chain,
        calls: tokens.map(t=>({target:t})),
        abi: {"inputs":[],"name":"asset","outputs":[{"internalType":"contract ERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"}
    })).output
    const totalAssets = (await sdk.api.abi.multiCall({
        block, chain,
        calls: tokens.map(t=>({target:t})),
        abi: {"inputs":[],"name":"totalAssets","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}
    })).output
    const balances = assets.reduce((bals, asset, i)=>{
        sdk.util.sumSingleBalance(bals, `arbitrum:${asset.output}`, totalAssets[i].output)
        return bals;
    }, {})
    return balances
}

module.exports={
    arbitrum:{tvl}
}