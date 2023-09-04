const { staking } = require('../helper/staking');
const { sumERC4626VaultsExport } = require('../helper/erc4626');
const { pool2 } = require('../helper/pool2')

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
}

const bavaStakingRewards = "0x2F445C4cC8E114893279fa515C291A3d02160b02"
const bavaToken = "0xe19A1684873faB5Fb694CfD06607100A632fF21c"

module.exports = {
  doublecounted: true,
  methodology: `Counts liquidty on the bava staking and lptoken staking on Avalanche and fx token staking on FunctionX`,
  functionx: { tvl: sumERC4626VaultsExport({ vaults: ['0x5c24B402b4b4550CF94227813f3547B94774c1CB'] }) }
};

Object.keys(config).forEach(chain => {
  const { vaults, pgVaults, tjVaults, } = config[chain]
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {
      const vInfo = await api.multiCall({ abi: 'function vaultInfo() view returns (address token, uint256 bal)', calls: vaults })
      vInfo.forEach(i => api.add(i.token, i.bal))
      const pgInfos = await api.multiCall({ abi: 'function vaultInfo() view returns (address token, address, uint256 bal, uint256, bool, bool)', calls: [pgVaults, tjVaults].flat() })
      pgInfos.forEach(i => api.add(i.token, i.bal))
    }
  }
})


module.exports.avax.staking = staking(bavaStakingRewards, bavaToken)
module.exports.avax.pool2 = pool2('0xdcedb18047945de1f05f649569b3d2b0e648d9c8', '0x2c3601fe09c23df8beb8216298d1502c985e376f')
