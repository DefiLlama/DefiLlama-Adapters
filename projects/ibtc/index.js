const sdk = require('@defillama/sdk')

const ibtcContract = "0x8154Aaf094c2f03Ad550B6890E1d4264B5DdaD9A";

async function tvl(timestamp, ethBlock, chainBlocks) {
    // 1iBTC=1XBTC=1BTC(exsat)=1BTC
    const ibtcTotalSupply = await sdk.api.abi.call({
        block: ethBlock,
        target: ibtcContract,
        abi: "uint256:totalSupply"
    })

    return ibtcTotalSupply
}

module.exports = {
    xsat: {
        tvl
    },
}
