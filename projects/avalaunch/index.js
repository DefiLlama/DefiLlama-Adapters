const sdk = require('@defillama/sdk')
const { unwrapUniswapLPs } = require('../helper/unwrapLPs')
const {fixAvaxBalances} = require('../helper/portedTokens')

async function tvl(){
    return {}
}

const lp = "0x42152bDD72dE8d6767FE3B4E17a221D6985E8B25"
const farm = "0x6E125b68F0f1963b09add1b755049e66f53CC1EA"
async function pool2(timestamp, ethBlock, chainBlocks){
    const block = chainBlocks.avax
    const lpLocked = await sdk.api.erc20.balanceOf({
        target: lp,
        owner: farm,
        block,
        chain: 'avax'
    })
    const balances = {}
    await unwrapUniswapLPs(balances, [{
        token: lp,
        balance: lpLocked.output
    }], block, 'avax', addr=>`avax:${addr}`)
    fixAvaxBalances(balances)
    return balances
}

module.exports={
    methodology: "Within pool2, it counts the XAVA-AVAX staked in the farm",
    tvl,
    pool2:{
        tvl:pool2
    }
}