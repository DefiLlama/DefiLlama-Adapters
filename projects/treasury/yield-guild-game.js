const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const Treasury = "0xe30ed74c6633a1b0d34a71c50889f9f0fdb7d68a";
const YGG = "0x25f8087EAD173b73D6e8B84329989A8eEA16CF73";
const Treasury1 = "0xf0103243f4d22b5696588646b21313d85916a16a"
const Treasury2 = "0x16b281438c5984a46d94acc6c4b31e252a03dfcf"
const Treasury3 = "0xcafeacdadd29f55ce935492e20f1f982df3fb51d"
const Treasury4 = "0x23eb4e02c29e69452718cd5caf2255488bc7ce3a"
const Treasury5 = "0xb981290d9d804075986482f0302c03a3cd2aff32"
const Treasury6 = "0x21653e2f0472afaf64ec85f585f0db4ab83a83f0"
const Treasury7 = "0x8e8d8015a7ffa49c83ee7a8773b0f69380cc6552"


const treasurySolana = "GvAm8xG5BSWXy286jWXWzYpN2xzPADQEoK9U8dQCDtzt"
const treasurySolana1 = "3fGSv3VdKvf7KSMt1o9Lb3dZ4YK9ScUTWktcrC4JJBTq"

module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        ADDRESSES.ethereum.DAI,//DAI
        ADDRESSES.ethereum.STETH,//stETH
        ADDRESSES.ethereum.MATIC,//MATIC
        ADDRESSES.ethereum.USDC,//USDC
        ADDRESSES.ethereum.USDT,
        '0x61E90A50137E1F645c9eF4a0d3A4f01477738406',//loka
        '0xbA6B0dbb2bA8dAA8F5D6817946393Aef8D3A4487',//HSF
        '0x232FB065D9d24c34708eeDbF03724f2e95ABE768',//SHEESHA
        '0x0d02755a5700414B26FF040e1dE35D337DF56218' //BEND
     ],
    owners: [Treasury, Treasury1, Treasury2, Treasury3, Treasury5, Treasury6, Treasury7],
    ownTokens: [YGG],
  },
  solana: {
    tokens: [ 
        "7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj"
     ],
    owners: [treasurySolana, treasurySolana1],
  },
  optimism: {
    tokens: [ 
       ADDRESSES.optimism.OP,
       ADDRESSES.optimism.WETH
     ],
    owners: [Treasury1],
  },
  polygon: {
    tokens: [ 
     "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
     "0x8dF3aad3a84da6b69A4DA8aeC3eA40d9091B2Ac4",
     "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
     "0x0b3F868E0BE5597D5DB7fEB59E1CADBb0fdDa50a"
     ],
    owners: [Treasury2, Treasury4],
  },
})