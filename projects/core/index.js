const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2, nullAddress, } = require('../helper/unwrapLPs')

// cVault UniV2 pairs
const CORE_WETH_V2 =    '0x32Ce7e48debdccbFE0CD037Cc89526E4382cb81b' // CORE/WETH - LP1
const CORE_CBTC_V2 =   '0x6fad7D44640c5cd0120DEeC0301e8cf850BecB68' // CORE/cBTC - LP2
const COREDAI_WCORE_V2 =   '0x01AC08E821185b6d87E68c67F9dc79A8988688EB' // coreDAI/wCORE - LP3 
const CORE_FANNY_V2 =   '0x85d9dcce9ea06c2621795889be650a8c3ad844bb' // CORE/FANNY

// Delta Sushi Pairs
const DELTA_ETH_SSLP =  '0x1498bd576454159bb81b5ce532692a8752d163e8' // DELTA/ETH - sushiLP

// ERC95 Tokens
const COREBTC =    '0x7b5982dcAB054C377517759d0D2a3a5D02615AB8' // cBTC
const COREDAI =   '0x00a66189143279b6DB9b77294688F47959F37642' // coreDAI
const WCORE   =    '0x17B8c1A92B66b1CF3092C5d223Cb3a129023b669' // wCORE

// ERC20 Tokens
const COREDAO =    '0xf66cd2f8755a21d3c8683a10269f795c0532dd58' // coreDAO
const DAI   =      ADDRESSES.ethereum.DAI // DAI
const DELTA =      '0x9EA3b5b4EC044b70375236A281986106457b20EF' // DELTA
const FANNY =       '0x8ad66f7e0e3e3dc331d3dbf2c662d7ae293c1fe0' // FANNY
const CORE = '0x62359ed7505efc61ff1d56fef82158ccaffa23d7' // CORE
const DELTA_RLP =      '0xfcfc434ee5bff924222e084a8876eee74ea7cfba' // DELTA rLP       
const WETH =       ADDRESSES.ethereum.WETH // wETH
const USDC = ADDRESSES.ethereum.USDC
const USDT = ADDRESSES.ethereum.USDT
const WBTC = ADDRESSES.ethereum.WBTC

// Ecosystem contracts
const CORE_DEPLOYER      = '0x5a16552f59ea34e44ec81e58b3817833e9fd5436' // CoreVault Deployer/Multisig
const CORE_VAULT_PROXY   = '0xc5cacb708425961594b63ec171f4df27a9c0d8c9' // 
const CORE_LGE_2         = '0xf7ca8f55c54cbb6d0965bc6d65c43adc500bc591' // CORE LGE 2
const CLEND = '0x54B276C8a484eBF2a244D933AF5FFaf595ea58c5' // cLEND
const LP_WRAPPER         = '0xe508a37101fce81ab412626ee5f1a648244380de' // LP Migration Wrapper
const FANNY_VAULT        = '0xbb791bc6106e4d949863e2ab76fc01ac0a9d7816' // Fanny Vault
const DELTA_DFV          = '0x9fe9bb6b66958f2271c4b0ad23f6e8dda8c221be' // Delta Deep Farming Vault
const DELTA_STABLE_YIELD = '0x3554fc4998f83967dcab5b2ef858e8e63fefbd26' // Delta StableYield
const DELTA_LSW          = '0xdaFCE5670d3F67da9A3A44FE6bc36992e5E2beaB' // Delta LSW
const DELTA_DISTRIBUTOR  = '0xF249C5B422758D91d8f05E1Cc5FC85CF4B667461' // Delta Distributor
const DELTA_MULTISIG     = '0xB2d834dd31816993EF53507Eb1325430e67beefa' // Delta Multisig

async function treasury(_, block){ 
  const tokensAndOwners = [
    [nullAddress, CORE_DEPLOYER],
    [DAI, CORE_DEPLOYER],
    [USDC, CORE_DEPLOYER],
    [CORE_CBTC_V2, CORE_LGE_2],
    [DAI, LP_WRAPPER],
    [WETH, DELTA_LSW],
    [USDT, DELTA_LSW],
    [WETH, DELTA_DISTRIBUTOR],
    [WETH, DELTA_MULTISIG],
    [CORE_WETH_V2, DELTA_MULTISIG],
  ]
  return sumTokens2({ block,  tokensAndOwners, })
}

async function tvl(_, block){ 
  const tokensAndOwners = [
    [WETH, DELTA_DFV],
    [DAI, CLEND],
    [WBTC, COREBTC],
    [DAI, COREDAI],
    [DELTA_ETH_SSLP, DELTA_RLP],
  ]
  return sumTokens2({ block,  tokensAndOwners, })
}

async function staking(_, block){ 
  const tokensAndOwners = [
    [COREDAO, CORE_VAULT_PROXY],
    [DELTA, DELTA_DFV],
    // [DELTA_RLP, DELTA_DFV],
    [CORE, FANNY_VAULT],
    // [FANNY, FANNY_VAULT],
    [DELTA, DELTA_STABLE_YIELD],
  ]
  return sumTokens2({ block,  tokensAndOwners })
}

module.exports = {
  ethereum: 
  {
      start: '2020-09-26', // 2020-09-26 17:46:46 (UTC),
      tvl, 
      treasury, 
      staking,
      // ownTokens: ['CORE', 'CoreDAO', 'Delta', 'FANNY', 'Delta rLP', 'cBTC', 'cDAI']
  }
};
