
const { tokensBare } = require('./tokenMapping')
const { getBalance } = require('../helper/utils')
const tronHelper = require('../helper/tron')
const { sumTokensExport, nullAddress } = require('../helper/unwrapLPs')

const defaultTokens = {
  ethereum: [
    nullAddress, tokensBare.usdt, tokensBare.usdc, tokensBare.link, tokensBare.dai, tokensBare.wbtc,
    '0x0000000000085d4780B73119b644AE5ecd22b376', // TUSD
    '0x4fabb145d64652a948d72533023f6e7a623c7c53', // BUSD
    '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0', // MATIC
    '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE', // SHIBA INU
    '0xa0b73e1ff0b80914ab6fe0444e65848c4c34450b', // CRO
    '0x9be89d2a4cd102d8fecc6bf9da793be995c22541',  // BBTC
    '0x50d1c9771902476076ecfc8b2a83ad6b9355a4c9',  // FTT
    '0x7a58c0be72be218b41c608b7fe7c5bb630736c71',  // PEOPLE
    '0x69af81e73a73b40adf4f3d4223cd9b1ece623074',  // MASK
    '0x9d65ff81a3c488d585bbfb0bfe3c7707c7917f54',  // SSV
    '0x111111111117dc0aa78b770fa6a738034120c302',  // 1INCH
    '0xef3a930e1ffffacd2fc13434ac81bd278b0ecc8d',  // FIS
    '0x3597bfd533a99c9aa083587b074434e61eb0a258',  // DENT
    '0x8a2279d4a90b6fe1c4b30fa660cc9f926797baa2',  // CHR
    '0x5a98fcbea516cf06857215779fd812ca3bef1b32',  // LIDO
    '0xddb3422497e61e13543bea06989c0789117555c5',  // COTI
    '0xa2120b9e674d3fc3875f415a7df52e382f141225',  // ATA
    '0xd26114cd6ee289accf82350c8d8487fedb8a0c07',  // OMG
    '0xb59490ab09a0f526cc7305822ac65f2ab12f9723',  // LIT
    '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',  // MKR
    '0x8798249c2e607446efb7ad49ec89dd1865ff4272',  // XSHUSHI
    '0xd533a949740bb3306d119cc777fa900ba034cd52',  // CRV
    '0xac51066d7bec65dc4589368da368b212745d63e8',  // ALICE
    '0x43dfc4159d86f3a37a5a4b3d4580b888ad7d4ddd',  // DODO
    '0xbb0e17ef65f82ab018d8edd776e8dd940327b28b',  // AXS
    '0x92d6c1e31e14520e676a687f0a93788b716beff5',  // DYDX
    '0x70e8de73ce538da2beed35d14187f6959a8eca96',  // XSGD
    '0xf57e7e7c23978c3caec3c3548e3d615c346e79ff',  // IMX
    '0x5732046a883704404f284ce41ffadd5b007fd668',  // BLZ
    '0xfca59cd816ab1ead66534d82bc21e7515ce441cf',  // RARI
    '0xaea46a60368a7bd060eec7df8cba43b7ef41ad85',  // FET
    '0x8290333cef9e6d528dd5618fb97a76f268f3edd4',  // ANKR
    '0xc477d038d5420c6a9e0b031712f61c5120090de9',  // BOSON
    '0x55296f69f40ea6d20e478533c15a6b08b654e758',  // XYO
    '0x4e15361fd6b4bb609fa63c81a2be19d873717870',  // FTM
    '0x0d8775f648430679a709e98d2b0cb6250d2887ef',  // BAT
    '0x44709a920fccf795fbc57baa433cc3dd53c44dbe',  // RADAR
    '0x7420b4b9a0110cdc71fb720908340c03f9bc03ec',  // JASMY
    '0x18aaa7115705e8be94bffebde57af9bfc265b998',  // AUDIO
    '0x6b3595068778dd592e39a122f4f5a5cf09c90fe2',  // SUSHI
    '0x15d4c048f83bd7e37d49ea4c83a07267ec4203da', // GALA
    '0x3845badade8e6dff049820680d1f14bd3903a5d0',  // SAND
    '0x0f5d2fb29fb7d3cfee444a200298f468908cc942',  // MANA
    '0x3506424f91fd33084466f402d5d97f05f8e3b4af',  // CHZ
    '0x4d224452801aced8b2f0aebe155379bb5d594381',  // APE
    '0x6c6ee5e31d828de241282b9606c8e98ea48526e2',  // HOT
    '0x00000000441378008ea67f4284a57932b1c000a5',  // TGBP
    '0xf629cbd94d3791c9250152bd8dfbdf380e2a3b9c',  // ENJ
    '0xbbbbca6a901c926f240b89eacb641d8aec7aeafd',  // LRC
    '0xc18360217d8f7ab5e7c516566761ea12ce7f9d72',  // ENS
    '0x4f9254c83eb525f9fcf346490bbb3ed28a81c667',  // CELR
    '0x056fd409e1d7a124bd7017459dfea2f387b6d5cd',  // GUSD
    '0x8e870d67f660d95d5be530380d0ec0bd388289e1',  // USPD
    '0x45804880de22913dafe09f4980848ece6ecbaf78',  // PAXG
    '0xf411903cbc70a74d22900a5de66a2dda66507255',  // VRA
    '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',  // UNI
    '0x320623b8e4ff03373931769a31fc52a4e78b5d70',  // RSR
    '0x430ef9263e76dae63c84292c3409d61c598e9682',  // PYR
    '0xb63b606ac810a52cca15e44bb630fd42d8d1d83d',  // MCO
    '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',  // AAVE
    '0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e',  // YFI
    '0xc944e90c64b2c07662a292be6244bdf05cda44a7',  // GRT
    '0x767fe9edc9e0df98e07454847909b5e959d7ca0e',  // ILV
    '0x6de037ef9ad2725eb40118bb1702ebb27e4aeb24',  // RNDR
    '0x090185f2135308bad17527004364ebcc2d37e5f6',  // SPELL
    '0x6b0b3a982b4634ac68dd83a4dbf02311ce324181',  // ALI
    '0x9fa69536d1cda4a04cfb50688294de75b505a9ae',  // DERC
    '0x4a220e6096b25eadb88358cb44068a3248254675',  // QNT
  ],
  tron: [
    nullAddress,
    'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t', // USDT
    'TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8',  // USDC
  ],
}

function cexExports(config) {
  const chains = Object.keys(config).filter(i => i !== 'bep2')
  const exportObj = {
    timetravel: false,
  }
  chains.forEach(chain => {
    let { addresses, tokensAndOwners, owners, tokens } = config[chain]
    if (addresses) {
      exportObj[chain] = {
        tvl: getChainTvl(chain, config),
      }
    } else {
      if (!tokensAndOwners && !tokens) {
        tokens = defaultTokens[chain]
        if (!tokens) throw new Error(chain, 'Missing default token list')
      }
      if (chain === 'tron') {
        exportObj.tron = {
          tvl: async () => tronHelper.sumTokens({ owners, tokens, tokensAndOwners })
        }
      } else {
        exportObj[chain] = {
          tvl: sumTokensExport({ owners, chain, tokens, tokensAndOwners, })
        }
      }
    }
  })
  return exportObj
}

function getChainTvl(chain, config) {
  const { addresses, geckoId, noParallel = false, } = config[chain]
  return async () => {
    let balance = 0
    if (noParallel) {
      for (const account of addresses)
        balance += await getBalance(chain, account)
    } else {
      balance = (await Promise.all(addresses.map(i => getBalance(chain, i)))).reduce((a, i) => a + i, 0)
    }
    return {
      [geckoId]: balance
    }
  }
}

module.exports = {
  cexExports,
  defaultTokens,
  getChainTvl,
}