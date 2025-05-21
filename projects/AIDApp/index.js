const sdk = require('@defillama/sdk')

const CORE_POOL_ADDRESS = "0xC439be7A5623bA800E7450F2cb6eDBc5A1983685"
const CORE_CHAIN = "core"

async function coreTvl(timestamp, block, chainBlocks) {
    const balances = {}
    const balance = await sdk.api.eth.getBalance({
        target: CORE_POOL_ADDRESS,
        block: chainBlocks[CORE_CHAIN],
        chain: CORE_CHAIN
    })
    sdk.util.sumSingleBalance(balances, "core:0x0000000000000000000000000000000000000000", balance.output)
    return balances
}

module.exports = {
    methodology: 'counts the number of NATIVE tokens in the Pool Bonding contract.',
    start: 24495957,
    core: {
        tvl:coreTvl,
    }
}