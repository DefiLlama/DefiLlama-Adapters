const {getBlock} = require('../helper/getBlock')
const sdk = require('@defillama/sdk')

const tokens = [
    ["0x765DE816845861e75A25fCA122bb6898B8B1282a", "celo-dollar"],
]
const holder = "0x1B7A4130827F8531626baEEE53fE02EA1c8865B7"

const toNumber = n=>Number(n)/1e18

async function tvl(timestamp, ethBlock, chainBlocks) {
    const chain = 'celo'
    const block = await getBlock(timestamp, chain, chainBlocks);
    for (token of tokens) {
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
    methodology: "All tokens locked in Allbridge contracts.",
    tvl
}
