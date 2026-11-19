// Bitty: self-custody smart vaults. An owner's vault holds its own funds; an asset manager or AI agent
// can trade them and put them to work in whitelisted protocols (Aave, Lido, Sky), never withdraw them.
// The earlier Bitty lending markets are retired.
//
// TVL is what the vaults hold: every vault the factory has activated (one CREATE2 address per chain),
// its native coin (ETH, or BNB on BSC) plus the guard-listed assets, plus the receipt tokens of its protocol positions
// (Aave aTokens, Lido stETH, Sky sUSDS). Those positions are also counted by the protocols
// themselves, hence doublecounted. Bitty's own fee vault is protocol revenue, not deposits, and is
// left out.
const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

const FACTORY = '0x3d7Ed3cD011B423dd11BE280BF926667CAf0F120'
const FEE_VAULT = '0xf0e7f6998b362bd15cf819c7ebfcace8865feca0'
const VAULT_ACTIVATED = 'event VaultActivated(address indexed owner, address vault)'

const config = {
  ethereum: {
    fromBlock: 26223315,
    tokens: [
      '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // WETH
      '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', // WBTC
      '0x68749665ff8d2d112fa859aa293f07a622782f38', // XAUt
      '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984', // UNI
      '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9', // AAVE
      '0xdef1ca1fb7fbcdc777520aa7f396b4e015f497ab', // COW
      '0x56072c95faa701256059aa122697b133aded9279', // SKY
      '0x514910771af9ca656af840dff83e8264ecf986ca', // LINK
      '0x9994e35db50125e0df82e4c2dde62496ce330999', // MORPHO
      '0xb50721bcf8d664c30412cfbc6cf7a15145234ad1', // ARB
      '0x57e114b691db790c35207b2e685d4a43181e6061', // ENA
      '0x5a98fcbea516cf06857215779fd812ca3bef1b32', // LDO
      '0x6982508145454ce325ddbe47a25d4ec3d2311933', // PEPE
      // Tokenized stocks and ETFs
      '0x3632dea96a953c11dac2f00b4a05a32cd1063fae', // CRCL
      '0xf042cfa86cf1d598a75bdb55c3507a1f39f9493b', // COIN
      '0xfdb46864a7c476f0914c5e82cded3364a9f56f8a', // SBET
      '0x14c3abf95cb9c93a8b82c1cdcb76d72cb87b2d4c', // AAPL
      '0xb812837b81a3a6b81d7cd74cfb19a7f2784555e5', // MSFT
      '0xba47214edd2bb43099611b208f75e4b42fdcfedc', // GOOGL
      '0xbb8774fb97436d23d74c1b882e8e9a69322cfd31', // AMZN
      '0x2d1f7226bd1f780af6b9a49dcc0ae00e8df4bdee', // NVDA
      '0x59644165402b611b350645555b50afb581c71eb2', // META
      '0xf6b1117ec07684d3958cad8beb1b302bfd21103f', // TSLA
      '0x0c666485b02f7a87d21add7aeb9f5e64975aa490', // PLTR
      '0x0c1f3412a44ff99e40bf14e06e5ea321ae7b3938', // AMD
      '0x3cafdbfe682aec17d5ace2f97a2f3ab3dcf6a4a9', // TSM
      '0xfda09936dbd717368de0835ba441d9e62069d36f', // INTC
      '0x0e397938c1aa0680954093495b70a9f5e2249aba', // QQQ
      '0xc9eef266834730340a55b6cc24621b31baf55581', // SPCX
      '0x032dec3372f25c41ea8054b4987a7c4832cdb338', // NFLX
      '0x998f02a9e343ef6e3e6f28700d5a20f839fd74e6', // HOOD
      '0xcabd955322dfbf94c084929ac5e9eca3feb5556f', // MSTR
      '0x33483a58079b4225b10e57958ca28ad7b9cdbaf7', // BMNR
      '0x71e2400cf1cb83204f33794ed326636a71a9aafc', // SNDK
      '0x0c8276e4fec072cf7854be69c70f7773d1610857', // COST
      // Stablecoins
      '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
      '0xdac17f958d2ee523a2206206994597c13d831ec7', // USDT
      // Position receipt tokens
      '0xa3931d71877c0e7a3148cb7eb4463524fec27fbd', // sUSDS
      '0x98c23e9d8f34fefb1b7bd6a91b7ff122f4e16f5c', // aEthUSDC
      '0x23878914efe38d27c4d67ab83ed1b93a74d4086a', // aEthUSDT
      '0x4d5f47fa6a74757f35c14fd3a6ef8e3c9bc514e8', // aEthWETH
      '0x5ee5bf7ae06d1be5997a1a72006fe6c607ec6de8', // aEthWBTC
      '0xae7ab96520de3a18e5e111b5eaab095312d7fe84', // stETH
    ],
  },
  base: {
    fromBlock: 52767463,
    tokens: [
      '0x4200000000000000000000000000000000000006', // WETH
      '0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf', // cbBTC
      '0xb20000000000000000000078ee7ce2fe4908108c', // NVDA
      '0xb2000000000000000000008bc8786b856e61707c', // META
      '0xb2000000000000000000002d0ba3164cc74f58b7', // GOOGL
      '0xb2000000000000000000004884b426556b92883d', // MSTR
      '0xb200000000000000000000c2e324d24d7eecd1fb', // AAPL
      '0xb2000000000000000000001e800a7f5189430cd0', // TSLA
      '0xb200000000000000000000d9192b6b456483c2e8', // AMZN
      '0xb2000000000000000000007d16372840df4dabbe', // PLTR
      '0xb2000000000000000000007b9fcbd005511acbd5', // SPCX
      '0xb200000000000000000000ab99cfa739e253872b', // MSFT
      '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913', // USDC
      '0xfde4c96c8593536e31f229ea8f37b2ada2699bb2', // USDT
      '0x5875eee11cf8398102fdad704c9e96607675467a', // sUSDS
      '0x4e65fe4dba92790696d040ac24aa414708f5c0ab', // aBasUSDC
      '0xd4a0e0b9149bcee3c920d2e00b5de09138fd8bb7', // aBasWETH
      '0xbdb9300b7cde636d9cd4aff00f6f009ffbbc8ee6', // aBascbBTC
    ],
  },
  arbitrum: {
    fromBlock: 516133264,
    tokens: [
      '0x82af49447d8a07e3bd95bd0d56f35241523fbab1', // WETH
      '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f', // WBTC
      '0x25d887ce7a35172c62febfd67a1856f20faebb00', // PEPE
      '0xaf88d065e77c8cc2239327c5edb3a432268e5831', // USDC
      '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9', // USDT
      '0xddb46999f8891663a8f2828d25298f70416d7610', // sUSDS
      '0x724dc807b04555b71ed48a6896b6f41593b8c637', // aArbUSDCn
      '0x6ab707aca953edaefbc4fd23ba73294241490620', // aArbUSDT
      '0xe50fa9b3c56ffb159cb0fca61f5c9d750e8128c8', // aArbWETH
      '0x078f358208685046a11c85e8ad32895ded33a249', // aArbWBTC
    ],
  },
  robinhood: {
    fromBlock: 92228495,
    tokens: [
      '0x0bd7d308f8e1639fab988df18a8011f41eacad73', // WETH
      '0xcec185eb182c47d1ba1efc84e6959e18cd620be4', // cbBTC
      '0xf177d86a28b520e3e396e4f3b96cd8e72d7dabd8', // UNI
      '0x117cc2133c37b721f49de2a7a74833232b3b4c0c', // SPY
      '0xd0601ce157db5bdc3162bbac2a2c8af5320d9eec', // NVDA
      '0xc9a981fee1f9dec688bb123ccdecc63d0debfc4e', // GLD
      '0x4a0e65a3eccec6dbe60ae065f2e7bb85fae35eea', // SPCX
      '0xc0d6457c16cc70d6790dd43521c899c87ce02f35', // META
      '0x2e0847e8910a9732eb3fb1bb4b70a580adad4fe3', // GOOGL
      '0xaf3d76f1834a1d425780943c99ea8a608f8a93f9', // AAPL
      '0xccee82fe024c36fa15e1005ede3e9e4787e23d09', // HIMS
      '0xec262a75e413fafd0df80480274532c79d42da09', // MSTR
      '0x322f0929c4625ed5bad873c95208d54e1c003b2d', // TSLA
      '0xe93237c50d904957cf27e7b1133b510c669c2e74', // MSFT
      '0x12f190a9f9d7d37a250758b26824b97ce941bf54', // AMZN
      '0xdf0992e440dd0be65bd8439b609d6d4366bf1cb5', // CRCL
      '0x4ea005168d7f09a7a0ba9d1def21a479950e44c2', // COST
      '0xc72b96e0e48ecd4dc75e1e45396e26300bc39681', // INTC
      '0x5fc5360d0400a0fd4f2af552add042d716f1d168', // USDG
    ],
  },
  bsc: {
    fromBlock: 132700666,
    tokens: [
      '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c', // WBNB
      '0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c', // BTCB
      '0x2170ed0880ac9a755fd29b2688956bd959f933f8', // ETH
      // Tokenized stocks and ETFs (Ondo Global Markets)
      '0x992879cd8ce0c312d98648875b5a8d6d042cbf34', // CRCL
      '0xa9ee28c80f960b889dfbd1902055218cba016f75', // NVDA
      '0x7313ea16493b2f55054df0131a3a14b043ec8992', // MSTR
      '0x091fc7778e6932d4009b087b191d1ee3bac5729a', // GOOGL
      '0x2494b603319d4d9f9715c9f4496d9e0364b59d93', // TSLA
      '0x8b6acf6041a81567f012ff6a4c6d96d5818d74bf', // MU
      '0x0cde6936d305d5b34667fc46425e852efd73559a', // QQQ
      '0x390a684ef9cade28a7ad0dfa61ab1eb3842618c4', // AAPL
      '0xa528caaa2f96090e379d43f90834c75df54d6e74', // INTC
      '0x4553cfe1c09f37f38b12dc509f676964e392f8fc', // AMZN
      '0xf8589b526fdd65f7f301c605a6e04f0f1b4b3620', // COIN
      '0x6bfe75d1ad432050ea973c3a3dcd88f02e2444c3', // MSFT
      '0x52ad57a7ea642e99a892afc79e937b383f1b59e9', // BMNR
      '0x8b872732b07be325a8803cdb480d9d20b6f8d11b', // SLV
      '0x6a708ead771238919d85930b5a0f10454e1c331a', // SPY
      '0xd7df5863a3e742f0c767768cdfcb63f09e0422f6', // META
      '0xc37042a7a4fa510d8884a433762ab87257b91965', // TSM
      '0xd0a58bc9d88d3ff48c0294cb7e45937d0e41a928', // SPCX
      '0x0ed2e3180edf393e6bf8db124bd15ddd54de150a', // AVGO
      '0x9f16e46c73b43bdb70861247d537bee4ea18f639', // AMD
      '0xfbd4d681c92ead6af0e49950c8b2e47eeacbb2db', // QCOM
      '0x19601179a60f55ff6636f5d1a8b6671053bd60a8', // HOOD
      '0x9351abd19f42101dd36025e495b98e910b255d78', // PLTR
      // Stablecoins
      '0x55d398326f99059ff775485246999027b3197955', // USDT
      '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d', // USDC
      // Position receipt tokens (Aave V3 BNB market)
      '0x9b00a09492a626678e5a3009982191586c444df9', // aBnbWBNB
      '0x56a7ddc4e848ebf43845854205ad71d5d5f72d3d', // aBnbBTCB
      '0x2e94171493fabe316b6205f1585779c887771e2f', // aBnbETH
      '0xa9251ca9de909cb71783723713b21e4233fbf1b1', // aBnbUSDT
      '0x00901a076785e0906d1028c7d6372d247bec7d61', // aBnbUSDC
    ],
  },
}

async function tvl(api) {
  const { fromBlock, tokens } = config[api.chain]
  const logs = await getLogs({ api, target: FACTORY, eventAbi: VAULT_ACTIVATED, onlyArgs: true, fromBlock })
  const owners = [...new Set(logs.map((l) => l.vault.toLowerCase()))].filter((v) => v !== FEE_VAULT)
  return sumTokens2({ api, owners, tokens: [nullAddress, ...tokens] })
}

module.exports = {
  methodology: 'Counts the native coin (ETH, or BNB on BNB Chain) and the tokens held by every Bitty vault the factory has activated, including the receipt tokens of positions a vault opened through Bitty (Aave aTokens, Lido stETH, Sky sUSDS). Bitty\'s own fee vault is excluded.',
  doublecounted: true,
}

Object.keys(config).forEach((chain) => {
  module.exports[chain] = { tvl }
})
