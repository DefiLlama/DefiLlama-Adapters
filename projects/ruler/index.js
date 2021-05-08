const sdk = require('@defillama/sdk');
const axios = require('axios')

const core = "0xF19f4490A7fCCfEf2DaB8199ACDB2Dc1B9027C18"
const xruler = '0x01F7Fd324b366380D2145Dfa6C7A76fdb75f17B9'
const ruler = '0x2aECCB42482cc64E087b6D2e5Da39f5A7A7001f8'
const crv3 = '0x6c3f90f043a72fa612cbac8115ee7e52bde6e490'

async function tvl(timestamp, block) {
    const balances = {}
    const data = await axios.get('https://api.rulerprotocol.com/backend_data/production')
    const balancesOnCore = await sdk.api.abi.multiCall({
        abi:'erc20:balanceOf',
        block,
        calls: data.data.pairs.collaterals.map(token=>({
            target: token,
            params: [core]
        }))
    })
    sdk.util.sumMultiBalanceOf(balances, balancesOnCore)
    const poolAddresses = Object.values(data.data.rewards).map(reward=>reward.poolAddress)
    const balancesOnPairs = await sdk.api.abi.multiCall({
        abi:'erc20:balanceOf',
        block,
        calls: poolAddresses.map(pool=>({
            target: crv3,
            params: [pool]
        }))
    })
    sdk.util.sumMultiBalanceOf(balances, balancesOnPairs)
    const rulerOnXruler = await sdk.api.erc20.balanceOf({
        block,
        target: ruler,
        owner: xruler
    })
    sdk.util.sumSingleBalance(balances, ruler, rulerOnXruler.output)
    delete balances[xruler]
    return balances;
}

module.exports = {
    tvl
}
