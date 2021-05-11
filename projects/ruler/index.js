const sdk = require('@defillama/sdk');
const axios = require('axios')

const core = "0xF19f4490A7fCCfEf2DaB8199ACDB2Dc1B9027C18"
const xruler = '0x01F7Fd324b366380D2145Dfa6C7A76fdb75f17B9'
const ruler = '0x2aECCB42482cc64E087b6D2e5Da39f5A7A7001f8'
const crv3 = '0x6c3f90f043a72fa612cbac8115ee7e52bde6e490'

const oldPools = [
    '0x1Daf17e6d1d9ed6aa9Fe9910AE17Be98C2C4e6BA',
    '0x52890A0c018fbab21794AD18e15f87fdb57fb975',
    '0x910A00594DC16dD699D579A8F7811d465Dfa2752',
    '0xf085c77B66cD32182f3573cA2B10762DF3Caaa50',
    '0x6Df2B0855060439251fee7eD34952b87b68EeEd9',
    '0xaFcc5DADcDcFc4D353Ab2d36fbd57b80513a34e6',
    '0x4AcE85cF348F316384A96b4739A1ab58f5123E7a',
    '0x23078d5BC3AAD79aEFa8773079EE703168F15cF5',
    '0xaF47f0877A9b26FfF12ec8253E07f92F89c6805D',
    '0x273AfbF6E257aae160749a61D4b83E06A841c3eB',
    '0xfB51e37CebC5D6f1569004206629BB7e47b6843f',
    '0xaC63c167955007D5166Fec43255AD5675EfC3102',
    '0xE764Fb1f870D621a197951F1A27aaC6d4F930329',
    '0xbe735E6dd6c47d86BF8510D3c36Cba1a359B8dDc',
    '0x2009f19A8B46642E92Ea19adCdFB23ab05fC20A6',
    '0x421CB018b91b4048FaAC1760Cee3B66026B940f2'
]

async function tvl(timestamp, block) {
    const balances = {}
    const data = await axios.get('https://api.rulerprotocol.com/backend_data/production')
    const balancesOnCore = await sdk.api.abi.multiCall({
        abi: 'erc20:balanceOf',
        block,
        calls: data.data.pairs.collaterals.map(token => ({
            target: token,
            params: [core]
        }))
    })
    sdk.util.sumMultiBalanceOf(balances, balancesOnCore)
    const poolAddresses = Object.values(data.data.rewards).map(reward => reward.poolAddress).concat(oldPools)
    const balancesOnPairs = await sdk.api.abi.multiCall({
        abi: 'erc20:balanceOf',
        block,
        calls: poolAddresses.map(pool => ({
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