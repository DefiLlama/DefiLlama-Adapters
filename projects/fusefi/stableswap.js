const sdk = require("@defillama/sdk");
const ADDRESSES = require('../helper/coreAssets.json')

const FUSD_ADDRESS = '0xd0ce1b4a349c35e61af02f5971e71ac502441e49'.toLowerCase()
const STABLESWAP_ADDRESS = '0x2a68D7C6Ea986fA06B2665d08b4D08F5e7aF960c'.toLowerCase()

const STABLES = [ADDRESSES.fuse.USDC, ADDRESSES.fuse.USDT, ADDRESSES.fuse.BUSD]

function transform(addr) {
    return "fuse:" + addr;
}

async function tvl(timestamp, block, chainBlocks) {
    const balances = {};

    const fuseBlock = chainBlocks.fuse

    const fusdBalances = await sdk.api.abi.multiCall({
        block: fuseBlock,
        abi: 'erc20:balanceOf',
        calls: STABLES.map(i => ({
            target: i.toLowerCase(),
            params: FUSD_ADDRESS.toLowerCase()
        })),
        chain: 'fuse'
    })

    STABLES.forEach((stable, idx) => {
        sdk.util.sumSingleBalance(balances, transform(stable), fusdBalances.output[idx].output)
    })

    const stableswapBalances = await sdk.api.abi.multiCall({
        block: fuseBlock,
        abi: 'erc20:balanceOf',
        calls: STABLES.map(i => ({
            target: i.toLowerCase(),
            params: STABLESWAP_ADDRESS.toLowerCase()
        })),
        chain: 'fuse'
    })

    STABLES.forEach((stable, idx) => {
        sdk.util.sumSingleBalance(balances, transform(stable), stableswapBalances.output[idx].output)
    })

    return balances
}

module.exports = {
    tvl
}
