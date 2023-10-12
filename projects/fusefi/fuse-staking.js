const sdk = require("@defillama/sdk");
const ADDRESSES = require('../helper/coreAssets.json')

const FUSE_STAKING_ADDRESS = "0xa3dc222eC847Aac61FB6910496295bF344Ea46be".toLowerCase()
const FUSE_ON_ETH = "0x970b9bb2c0444f5e81e9d0efb84c8ccdcdcaf84d";

const systemTotalStaked = 'function systemTotalStaked() public view returns (uint256)'

function transform(addr) {
    if (addr.toLowerCase() === ADDRESSES.fuse.WFUSE.toLowerCase()) return FUSE_ON_ETH
    return "fuse:" + addr;
}

async function tvl(timestamp, block, chainBlocks) {
    const balances = {};

    const fuseBlock = chainBlocks.fuse;

    const totalStaked = await sdk.api.abi.call({
        chain: 'fuse',
        block: fuseBlock,
        target: FUSE_STAKING_ADDRESS,
        abi: systemTotalStaked
    });

    sdk.util.sumSingleBalance(balances, transform(ADDRESSES.fuse.WFUSE), totalStaked.output)

    return balances
}

module.exports = {
    tvl
}
