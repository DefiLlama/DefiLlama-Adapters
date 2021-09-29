const axios = require('axios');
const sdk = require('@defillama/sdk');
const BigNumber = require('bignumber.js');

const limit = 1

async function strategies(block) {
    let totalStrategies = []
    let current = 0
    do {
        // Node is semi-pruned, only every 100th block is stored
        const url = "https://lcd.terra.dev/wasm/contracts/terra1g7jjjkt5uvkjeyhp8ecdz4e4hvtn83sud3tmh2/store?query_msg=" +
            encodeURIComponent(`{"get_strategies": {"limit": ${limit}, "start_from": ${current}}}`) +
            `&height=${block - (block % 100)}`;
        const pagedStrategies = (await axios.get(url)).data.result.strategies
        totalStrategies = totalStrategies.concat(pagedStrategies)
        current += limit
    } while (totalStrategies.length === current);
    return totalStrategies
}

async function tvl(timestamp, ethBlock, chainBlocks) {
    const { block } = await sdk.api.util.lookupBlock(timestamp, {
        chain: 'terra'
    })
    const strats = await strategies(block)
    const total = strats.reduce((t, s)=>t+Number(s.tvl), 0)
    return {
        '0xa47c8bf37f92abed4a126bda807a7b7498661acd': BigNumber(total*1e12).toFixed(0)
    }
}

module.exports = {
    methodology: "Total TVL on vaults",
    tvl
}