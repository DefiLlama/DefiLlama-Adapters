const {getBlock} = require('../helper/getBlock')
const {aaveChainTvl} = require('../helper/aave')
const sdk = require('@defillama/sdk')

const tokens = [
    ["0x765DE816845861e75A25fCA122bb6898B8B1282a", "celo-dollar"],
    ["0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73", "celo-euro"]
]

const tokenToName={
    "0x471EcE3750Da237f93B8E339c536989b8978a438": "celo",
    "0x765DE816845861e75A25fCA122bb6898B8B1282a": "celo-dollar",
    "0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73": "celo-euro",
}

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
    const bal2 = await aaveChainTvl(chain, "0xF03982910d17d11670Dc3734DD73292cC4Ab7491", addr=>addr, ["0x43d067ed784D9DD2ffEda73775e2CC4c560103A1"])(timestamp, ethBlock, {
        ...chainBlocks,
        celo: block
    })
    Object.entries(bal2).map(entry=> sdk.util.sumSingleBalance(balances, tokenToName[entry[0]], toNumber(entry[1])))
    return balances
}

// v2 addresses on https://github.com/moolamarket/moola-v2/commit/ab273248af81aa743310b4fd48533462aefe39e9
module.exports={
    methodology: "Same as compound, we just get all the collateral (not borrowed money) on the lending markets",
    celo:{
        tvl
    }
}
