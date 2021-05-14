const sdk = require('@defillama/sdk');

const vaults = [
    // farm, token used
    ['0x067b9FE006E16f52BBf647aB6799f87566480D2c', '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'], // USDC
    ['0x70e51DFc7A9FC391995C2B2f027BC49D4fe01577', '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'], // WETH
    ['0x17E9ed51feD2F190D50f5bd4f1a8C9CbCd36162A', '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599'], // WBTC
]

async function tvl(timestamp, block, chainBlocks) {
    const balances = {}
    await Promise.all(vaults.map(async vault=>{
        const supply = await sdk.api.erc20.totalSupply({
            target: vault[0],
            block
        })
        sdk.util.sumSingleBalance(balances, vault[1], supply.output)
    }))
    return balances
}

module.exports = {
  ethereum:{
    tvl,
  },
  tvl
}