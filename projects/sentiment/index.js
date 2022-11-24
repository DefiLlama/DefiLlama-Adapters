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
    const userAccounts = (await sdk.api.abi.call({
        block, chain,
        target: "0x17b07cfbab33c0024040e7c299f8048f4a49679b",
        abi: {"inputs":[],"name":"getAllAccounts","outputs":[{"internalType":"address[]","name":"","type":"address[]"}],"stateMutability":"view","type":"function"}
    })).output
    const equity = (await sdk.api.abi.multiCall({
        block, chain,
        calls: userAccounts.map(t=>({target:"0xc0ac97A0eA320Aa1E32e9DEd16fb580Ef3C078Da", params: [t]})),
        abi: {"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"getBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
    })).output
    const borrows = (await sdk.api.abi.multiCall({
        block, chain,
        calls: userAccounts.map(t=>({target:"0xc0ac97A0eA320Aa1E32e9DEd16fb580Ef3C078Da", params: [t]})),
        abi: {"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"getBorrows","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}
    })).output
    for(let i=0; i<equity.length; i++){
        sdk.util.sumSingleBalance(balances, "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", equity[i].output-borrows[i].output)
    }
    return balances
}

module.exports={
    misrepresentedTokens: true,
    arbitrum:{tvl}
}