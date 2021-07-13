const sdk = require('@defillama/sdk')

const dai = "0x6b175474e89094c44da98b954eedeac495271d0f"
async function tvl(timestamp, block) {
    const balanceOfResults = await sdk.api.abi.multiCall({
        calls:[{
            target: dai,
            params: ["0xa57fC404f69fCE71CA26e26f0A4DF7F35C8cd5C3"]
        },{
            target: dai,
            params: ["0x187922d4235D10239b2c6CCb2217aDa724F56DDA"]
        }],
        abi: 'erc20:balanceOf',
        block
    })
    const balances = {}
    sdk.util.sumMultiBalanceOf(balances, balanceOfResults, true)
    return balances
}

module.exports = {
    tvl
}