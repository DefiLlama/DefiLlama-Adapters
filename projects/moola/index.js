const {getBlock} = require('../helper/getBlock')
const sdk = require('@defillama/sdk')

const tokens = [
    ["0x765DE816845861e75A25fCA122bb6898B8B1282a", "celo-dollar"],
    ["0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73", "celo-euro"]
]
const holder = "0xAF106F8D4756490E7069027315F4886cc94A8F73"

const toNumber = n=>Number(n)/1e18

async function tvl(timestamp, ethBlock, chainBlocks) {
    const chain = 'celo'
    const block = await getBlock(timestamp, chain, chainBlocks);
    const balances = {
        "celo": toNumber((await sdk.api.eth.getBalance({
            block,
            chain,
            target: holder
        })).output)
    }
    for(token of tokens){
        const bal = await sdk.api.erc20.balanceOf({
            block,
            chain,
            target: token[0],
            owner: holder
        })
        sdk.util.sumSingleBalance(balances, token[1], toNumber(bal.output))
    }
    return balances
}

module.exports={
    methodology: "Same as compound, we just get all the collateral (not borrowed money) on the lending markets",
    tvl
}
