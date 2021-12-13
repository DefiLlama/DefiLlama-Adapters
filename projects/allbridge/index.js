const {getBlock} = require('../helper/getBlock')
const sdk = require('@defillama/sdk')

const cUSD = "0x765DE816845861e75A25fCA122bb6898B8B1282a"
const optics_USDC = "0x2A3684e9Dc20B857375EA04235F2F7edBe818FA7"

const tokens = [
    [cUSD, "celo-dollar"],
    [optics_USDC, "celo-dollar"]
]
const holder = "0xBBbD1BbB4f9b936C3604906D7592A644071dE884"

const decimals = {
    [cUSD]: 18,
    [optics_USDC]: 6
}
const toNumber = (token, n) => Number(n)/Math.pow(10, decimals[token] ?? 18)

async function tvl(timestamp, ethBlock, chainBlocks) {
    balances = {}
    const chain = 'celo'
    const block = await getBlock(timestamp, chain, chainBlocks);
    for (token of tokens) {
        const bal = await sdk.api.erc20.balanceOf({
            block,
            chain,
            target: token[0],
            owner: holder
        })
        sdk.util.sumSingleBalance(balances, token[1], toNumber(token[0], bal.output))
    }
    return balances
}

module.exports={
    methodology: "All tokens locked in Allbridge contracts.",
    tvl
}
