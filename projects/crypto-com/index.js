const { cexExports } = require('../helper/cex')
const { tokensBare } = require('../helper/tokenMapping')

const config = {
  bitcoin: {
    geckoId: 'bitcoin',
    addresses: [
      'bc1qpy4jwethqenp4r7hqls660wy8287vw0my32lmy',
      '3LhhDLBVWBZChNQv8Dn4nDKFnCyojG1FqN',
      '3QsGsAXQ4rqRNvh5pEW55hf3F9PEyb7rVq',
      'bc1qr4dl5wa7kl8yu792dceg9z5knl2gkn220lk7a9',
      'bc1q4c8n5t00jmj8temxdgcc3t32nkg2wjwz24lywv',
      '14m3sd9HCCFJW4LymahJCKMabAxTK4DAqW',
    ],
    noParallel: true,
  },
  ethereum: {
    owners: [
      '0x72a53cdbbcc1b9efa39c834a540550e23463aacb',
      '0x6262998ced04146fa42253a5c0af90ca02dfd2a3',
      '0xcffad3200574698b78f32232aa9d63eabd290703',
      '0x7758e507850da48cd47df1fb5f875c23e3340c50',
      '0x46340b20830761efd32832a74d7169b29feb9758',
    ],
    tokens: [
      '0x0000000000000000000000000000000000000000', tokensBare.usdt, tokensBare.usdc, tokensBare.link, tokensBare.dai, tokensBare.wbtc,
    '0x0000000000085d4780B73119b644AE5ecd22b376', // TUSD
    '0x4fabb145d64652a948d72533023f6e7a623c7c53', // BUSD
    '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0', // MATIC
    '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE', // SHIBA INU
    '0xa0b73e1ff0b80914ab6fe0444e65848c4c34450b', // CRO
    '0x4a220e6096b25eadb88358cb44068a3248254675', // QNT
    '0x15d4c048f83bd7e37d49ea4c83a07267ec4203da', // GALA
'0x3845badade8e6dff049820680d1f14bd3903a5d0', // SAND
'0x0f5d2fb29fb7d3cfee444a200298f468908cc942', // MANA
'0x3506424f91fd33084466f402d5d97f05f8e3b4af', // CHZ
'0x4d224452801aced8b2f0aebe155379bb5d594381', // APE 
'0x6c6ee5e31d828de241282b9606c8e98ea48526e2', // HOT
'0x00000000441378008ea67f4284a57932b1c000a5', // TGBP
'0xf629cbd94d3791c9250152bd8dfbdf380e2a3b9c', // ENJ 
'0xbbbbca6a901c926f240b89eacb641d8aec7aeafd', // LRC
'0xc18360217d8f7ab5e7c516566761ea12ce7f9d72', // ENS
'0x4f9254c83eb525f9fcf346490bbb3ed28a81c667', // CELR
'0x056fd409e1d7a124bd7017459dfea2f387b6d5cd', // GUSD
'0x8e870d67f660d95d5be530380d0ec0bd388289e1', // USPD
'0x45804880de22913dafe09f4980848ece6ecbaf78', // PAXG
'0xf411903cbc70a74d22900a5de66a2dda66507255', // VRA
'0x1f9840a85d5af5bf1d1762f925bdaddc4201f984', // UNI
'0x320623b8e4ff03373931769a31fc52a4e78b5d70', // RSR
'0x430ef9263e76dae63c84292c3409d61c598e9682', // PYR
'0xb63b606ac810a52cca15e44bb630fd42d8d1d83d', // MCO
'0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9', // AAVE
'0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e', // YFI
'0xc944e90c64b2c07662a292be6244bdf05cda44a7', // GRT 
'0x767fe9edc9e0df98e07454847909b5e959d7ca0e', // ILV
'0x6de037ef9ad2725eb40118bb1702ebb27e4aeb24', // RNDR
'0x090185f2135308bad17527004364ebcc2d37e5f6', // SPELL
'0x6b0b3a982b4634ac68dd83a4dbf02311ce324181', // ALI
'0x9fa69536d1cda4a04cfb50688294de75b505a9ae', // DERC 

    ]
  },
}

module.exports = cexExports(config)
