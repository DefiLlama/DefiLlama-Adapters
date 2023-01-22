const sdk = require('@defillama/sdk')

const CVX = '0x4e3fbd56cd56c3e72c1403e103b45db9da5b9d2b'
const pxCVX = '0xbce0cf87f513102f22232436cca2ca49e815c3ac'

async function tvl(timestamp, block, chainBlocks){
    const balances = {}
    const pxCVXSupply = await sdk.api.erc20.totalSupply({
        target: pxCVX,
        chain: 'ethereum',
        block: chainBlocks['ethereum']
    }).then(result => result.output)
    sdk.util.sumSingleBalance(balances, CVX, pxCVXSupply)

    return balances
}

module.exports = {
    timetravel: true,
    methodology: "tvl = Total CVX locked in Pirex",
    ethereum:{
        tvl
    },
}