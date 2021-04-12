const sdk = require('@defillama/sdk')
const abi = require('./abi.json')

const thetaVault = '0x0fabaf48bbf864a3947bdd0ba9d764791a60467a'
const weth = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'

async function tvl(timestamp, block) {
    const totalBalance = await sdk.api.abi.call({
        target: thetaVault,
        block,
        abi: abi.totalBalance
    })
    return {
        [weth]: totalBalance.output
    }
}

module.exports = {
    ethereum:{
        tvl
    },
    tvl
  }