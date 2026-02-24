const { aaveV3Export } = require('../projects/helper/aave')
const { buildProtocolExports } = require('./utils')

function aaveV3ExportFn(chainConfigs) {
  return aaveV3Export(chainConfigs)
}

const configs = {
  'aave-horizon': {
    ethereum: ['0x53519c32f73fE1797d10210c4950fFeBa3b21504'],
  },
  'tydro': {
    ink: '0x96086C25d13943C80Ff9a19791a40Df6aFC08328',
  },
  'voltage-lending': {
    fuse: ['0x87cB512CFB0f18F4Dd9652a186922cf6A4e63213'],
  },
  'unilend-protocol': {
    unit0: ['0x99118c1Ca7D0DC824719E740d4b4721009a267d6'],
  },
  // --- newly migrated aaveV3Export protocols ---
  'zentra': {
    citrea: '0x0FC811fE6bD0Be53717f9ca722E30a7bc4B90C31',
  },
  'ploutos': {
    hallmarks: [],
    base: ['0x7dcb86dC49543E14A98F80597696fe5f444f58bC'],
    arbitrum: ['0x0F65a7fBCb69074cF8BE8De1E01Ef573da34bD59'],
    polygon: ['0x6A9b632010226F9bBbf2B6cb8B6990bE3F90cb0e'],
    katana: ['0x4DC446e349bDA9516033E11D63f1851d6B5Fd492'],
    plasma: ['0x9C48A6D3e859ab124A8873D73b2678354D0B4c0A'],
    hemi: ['0x0F65a7fBCb69074cF8BE8De1E01Ef573da34bD59'],
    ethereum: ['0x1A875c28610F0155D377bBD725cc59d055e2D192'],
    avax: ['0xA5217D7cceAa7DCdcc613E88DcFc98A0f145b384'],
    hyperliquid: ['0x429e14fCa77b0eC3FAf32a65d09Da97e67E82826'],
  },
  'hyperloan': {
    hallmarks: [
      ['2025-11-01', "Start BESC Rewards on HyperLoan Protocol"],
    ],
    besc: ['0x3aDDb1f9F159326864B3d7046fB78150955e8587'],
  },
  'sake-finance': {
    soneium: ['0x2BECa16DAa6Decf9C6F85eBA8F0B35696A3200b3', '0x3b5FDb25672A0ea560E66905B97d0c818a00f5eb'],
  },
  'kittypunch-kona-lend': {
    abstract: ['0xDfc422c8793864ecD12Bc59F2024614034BcB078'],
  },
  'aqualoan': {
    bsc: ['0xDc33eAA50B8707f791478Cec324e451E20FDa7ed'],
  },
  'Eden-finance': {
    assetchain: ['0x1d0c5587b05D2FBE944c118d581C3102E06D1726'],
  },
  'lendle-isolated-markets': {
    mantle: {
      poolDatas: [
        '0xaDB43eF86581a517CED608839d4D24E49d41187c',
        '0x7E1E69937a38ec0EAb971CD1636943e534C657Ef',
        '0x6B99F330Bd277e17a092922Fb8036c9B000F9365',
        '0xc156E06e7e94a31250eF2DDeEe338f1E36C3b956',
        '0x7e31765855d6251837122e042c02518F4e1Bc3f3',
        '0xBE584AfCcAd0882d24F6cF2c27BC997b49A6c367',
        '0x60b6642207a157455746cFaF7273B4b2691e5416',
        '0x84a04bca517C77d06D2A01b44431Ccff114e82a4',
        '0xAba0f27208F05f5063887767c547e12B1235Dc41',
        '0xa53480df32d65B76cD6fCb2399786d0CFf65FD54',
        '0x79Ef83f6635Ea6BdFB0B3F7022f783ad97019F31',
        '0x69d09E0051669072914eC0bB9308aC670e214bD9',
        '0x40025ad3f5438aC971e61Ba97F9Ab1B8b818900d',
      ],
      staking: ['0x5C75A733656c3E42E44AFFf1aCa1913611F49230', '0x25356aeca4210eF7553140edb9b8026089E49396'],
    },
  },
}

module.exports = buildProtocolExports(configs, aaveV3ExportFn)
