const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk')

const stateContract = "0x4e908F706f8935f10C101Ea3D7B2DEfc78df284e"
const dai = ADDRESSES.ethereum.DAI

async function tvl(timestamp, ethBlock, chainBlocks) {
    const daiDeposited = await sdk.api.abi.call({
        target: stateContract,
        abi: 'uint256:getTotalDaiReserves',
        block: chainBlocks.arbitrum,
        chain: "arbitrum"
    })
    return {
        [dai]: daiDeposited.output
    }
}

module.exports = {
        arbitrum: {
        tvl
    }
}