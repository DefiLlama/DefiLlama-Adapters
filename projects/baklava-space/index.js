const { staking } = require('../helper/staking');
const { pool2 } = require('../helper/pool2');
const { sumTokens2 } = require('../helper/unwrapLPs');

const config = {
  avax: {
    vaults: [
      '0xf160C07c5a7e80F9bFA61f9554FF449b8B3eD990',
      '0x7a2e6F95cA2B90CDC52f92dda8A7F2d0C2663264',
    ],
    pgVaults: [
      '0x91CCbbC44221ddb70f54d9E911C4fE80be944232',
      '0xD146D2b9E017585faBbE0943e122b07FaefF1380',
      '0xd0Cf7b1071c7c12a7c36ca4CA863B2583D9C338A',
      '0x0D382907A342c0ac2DD735a0F8defe59A28D5DE4',
      '0xeccFBE23903932DE517b0eb1f80d9e8779A864E0',
      '0x17bc0557D5946b1304f8c0b5af18f4FadDBf9D49',
      '0xc331aF15574d80a4a34FEd8Ee1369E7900dCD47E',
      '0x9841c066021Bfb9D1c79e8E82A597Dd133d8804F',
      '0x9841c066021Bfb9D1c79e8E82A597Dd133d8804F',
    ],
    tjVaults: [
      '0xFec19beb4e68B4c93622c51d4ad8AF804fe421AA',
      '0x2d3147AC6dB2a8DfeE1946a9D59b1B0CBc3489c9',
      '0xBFd13f98A84C59D42D2086298100D4d7A715733D',
      '0x5cBD2724A4398748615a2ad62ff80607dAC233fC',
    ],
  },
  functionx: [
    '0x1c1e54d8bffb02f261814ca8f06f03efed25ab8d',
    '0x76f2f94429155e4e6e4c126ac9b7165ed347c9d6',
    '0x610629af1cc8543c0e0348f62559801dc4099a76',
    '0xefb5a32735390d01e37b620407892e35acc998c3',
    '0x0fe1ead49b97fbd65875ad8a9da0b869552d0caa'
  ],
  base: [
        '0x37f716f6693EB2681879642e38BbD9e922A53CDf',
        '0x49AF8CAf88CFc8394FcF08Cf997f69Cee2105f2b',
        '0x83B2D994A1d16E6A3A44281D12542E2bc0d5EBFD',
        '0xea505C49B43CD0F9Ed3b40D77CAF1e32b0097328',
        '0xc5DFb9698440Eaeb0A7C9dAA5a795e9B48CacadF'
  ],
  bsc: [
    '0x6659B42C106222a50EE555F76BaD09b68EC056f9',
    '0x81Ea18C7c54217C523F2C072C72D732869c4d661'
  ]
}

const bavaStakingRewards = "0x2F445C4cC8E114893279fa515C291A3d02160b02"
const bavaToken = "0xe19A1684873faB5Fb694CfD06607100A632fF21c"

const baseBavaStakingRewards = "0xD62634fe21A6c050CF4a05a36d1D9315a9c379b7"
const baseBavaToken = "0x3fbdE9864362CE4Abb244EbeF2EF0482ABA8eA39"

module.exports = {
  doublecounted: true,
  methodology: `Counts liquidty on the bava staking and lptoken staking on Avalanche and fx token staking on FunctionX`,
  // we have added the other functionx erc4626 vaults, but the token is an LP token and this function is unable to get the price
  functionx: { tvl: fxTvl },
  base: { tvl: baseTvl },
  bsc: { tvl: bscTvl }
};

async function fxTvl(api) {
  const vaults = ['0x5c24B402b4b4550CF94227813f3547B94774c1CB', ...config.functionx]
  const tokens = await api.multiCall({ abi: 'address:asset', calls: vaults })
  const bals = await api.multiCall({ abi: 'uint256:totalAssets', calls: vaults })
  api.addTokens(tokens, bals)
  return sumTokens2({ api, resolveLP: true, })
}

async function baseTvl(api) {
  const vaults = [...config.base]
  const tokens = await api.multiCall({ abi: 'address:asset', calls: vaults })
  const bals = await api.multiCall({ abi: 'uint256:totalAssets', calls: vaults })
  api.addTokens(tokens, bals)
  return sumTokens2({ api, resolveLP: true, })
}

async function bscTvl(api) {
  const vaults = [...config.bsc]
  const tokens = await api.multiCall({ abi: 'address:asset', calls: vaults })
  const bals = await api.multiCall({ abi: 'uint256:totalAssets', calls: vaults })
  api.addTokens(tokens, bals)
  return sumTokens2({ api, resolveLP: true, })
}

const { vaults, pgVaults, tjVaults, } = config.avax
module.exports.avax = {
  tvl: async (api) => {
    const vInfo = await api.multiCall({ abi: 'function vaultInfo() view returns (address token, uint256 bal)', calls: vaults })
    vInfo.forEach(i => api.add(i.token, i.bal))
    const pgInfos = await api.multiCall({ abi: 'function vaultInfo() view returns (address token, address, uint256 bal, uint256, bool, bool)', calls: [pgVaults, tjVaults].flat() })
    pgInfos.forEach(i => api.add(i.token, i.bal))
  }
}

module.exports.avax.staking = staking(bavaStakingRewards, bavaToken)
module.exports.avax.pool2 = pool2('0xdcedb18047945de1f05f649569b3d2b0e648d9c8', '0x2c3601fe09c23df8beb8216298d1502c985e376f')

module.exports.base.staking = staking(baseBavaStakingRewards, baseBavaToken)
