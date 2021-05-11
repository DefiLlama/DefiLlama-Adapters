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

const replacements = {
    '0x898BAD2774EB97cF6b94605677F43b41871410B1': '0x0000000000000000000000000000000000000000', // vETH2 -> ETH
    '0xa921392015eB37c5977c4Fd77E14DD568c59D5F8': '0x4688a8b1F292FDaB17E9a90c8Bc379dC1DBd8713', // xCOVER -> COVER
    '0x16f9D564Df80376C61AC914205D3fDfF7057d610': '0x6399C842dD2bE3dE30BF99Bc7D1bBF6Fa3650E70', // xPREMIA -> PREMIA
    '0xE14d13d8B3b85aF791b2AADD661cDBd5E6097Db1': '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e' // yvYFI -> YFI
}

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
    Object.keys(balances).forEach(token=>{
        if(replacements[token] !== undefined){
            balances[replacements[token]] = balances[token];
            delete balances[token];
        }
    })
    return balances;
}

module.exports = {
    tvl
}