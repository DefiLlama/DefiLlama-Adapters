const sdk = require('@defillama/sdk')
const abis = require('./abis.json')

const ethShieldV1 = "0x02b4E089E96a0A672dE0a0d93E2869B899b15a44"
const ethShieldUSDTV1 = "0x29abf1a011cdfb9548dc8faa6d19b1b39808bf58"
const ethShieldDAIV1 = "0x54A8e0C76Eec21DD30842FbbcA2D336669102b77"
const ethShieldSUTERV1 = "0xab4e72599e2cec5dcc8249657833b3408905900e"

const ethShieldV2 = "0x934cc5704165711296207b5AFc87933AE0685a4C"
const ethShieldUSDTV2 = "0xB8fcF79EAd34E98e45fc21E5dB1C5C561d906371"
const ethShieldDAIV2 = "0xbdf418486D438e44F5aAC6aF86330dA638ea70AD"

const bscShieldV1 = "bsc:0x2A00d7d2de1E147a3BCAa122B4EC5D6f9F0c1147"
const bscShieldBUSDV1 = "bsc:0xe557c77Ed24df7cDF21ED55a8C56Ea36CeBD5BD2"
const bscShieldCAKEV1 = "bsc:0x8cc4c8529c0D8bb9B9FA197530d656cCBcB88DeB"
const bscShieldBAKEV1 = "bsc:0x9D529c70fD8e072786b721190f6E6B30e433690a"
const bscShieldSUTERV1 = "bsc:0x617edfadeC530aE747088672831EaC5B1A6A5220"
const bscShieldXSUTERV1 = "bsc:0x4de5cB2EB81A37DD768fc58fe0ca7b811C997c35"

const bscShieldV2 = "bsc:0x5bb6eE37a6503fe381207c3BAC0Aa6d7B33590Fa"
const bscShieldBUSDV2 = "bsc:0x5e2A040fC56082Bf860FFA7A6679569CE5a20B47"
const bscShieldCAKEV2 = "bsc:0x1330790E5d031A41B72BB16946C4f927499862bf"
const bscShieldBAKEV2 = "bsc:0x997E3A38589454e2b0E4190e94090f6eDaF0a5b5"
const bscShieldSUTERV2 = "bsc:0x8416BA108F5b69c62e6Fc83D6EdAD9a525c971d9"
const bscShieldXSUTERV2 = "bsc:0x8231d3c8c685cdcAC44C83DC647EE1000292cA3B"


const ftmShieldV2 = "fantom:0xa6A96a56814818A404CFc3a2F79ef38eb709DCbD"

// const stakingContract = "0x79DB0dAa012F4b98F332A9D45c80A1A3FFaa6f9a"
// const wbnb = "bsc:0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c"

async function tvl(timestamp, ethBlock, chainBlocks){
    const stakedBNB = await sdk.api.abi.call({
        target: stakingContract,
        abi: abis.lbnbMarketCapacityCountByBNB,
        block: chainBlocks['bsc'],
        chain: 'bsc'
    })
    return {
        [wbnb]:stakedBNB.output
    }
}

module.exports = {
  bsc:{
    tvl,
  },
  tvl
}