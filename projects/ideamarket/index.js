const sdk = require('@defillama/sdk')
const getTotalDaiReserves = require('./abi.json')

const stateContract = "0x4e908F706f8935f10C101Ea3D7B2DEfc78df284e"
const dai = "0x6b175474e89094c44da98b954eedeac495271d0f"

async function tvl(timestamp, ethBlock, chainBlocks) {
    const daiDeposited = await sdk.api.abi.call({
        target: stateContract,
        abi: getTotalDaiReserves,
        block: chainBlocks.arbitrum,
        chain: "arbitrum"
    })
    return {
        [dai]: daiDeposited.output
    }
}

module.exports = {
    timetravel: true,
    arbitrum: {
        tvl
    }
}