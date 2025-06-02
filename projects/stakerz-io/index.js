const { sumUnknownTokens } = require('../helper/unknownTokens')
async function tvl(api) {
  const vaults = [
    '0x938d7EEC5130016AFA6f97DB18c3e5E869AF4D85',
    '0x4B247bA8EBbf1331ADFaa8096309FF2693C3243C',
    '0xBD3464c682649590C2403F41eD51161C96f19f6c',
    '0xb5FDb80b5237AA2Ef6818043999E24f41ecE4D68',
    '0x61cDa2e59B359eb3297547D66e8b3B1ac65a07d7',
    '0xc4E35A5EEf1761e790B229A7e5EaC66e364DB187',
  ]
  const tokens = await api.multiCall({ abi: 'address:want', calls: vaults })
  const bals = await api.multiCall({ abi: 'uint256:balance', calls: vaults })
  api.addTokens(tokens, bals)
  return sumUnknownTokens({ api, resolveLP: true, useDefaultCoreAssets: false  })
}

module.exports = {
  misrepresentedTokens: true,
  doublecounted: true,
  kava: {
    tvl: () => ({}),
    staking: () => ({})
  },
  deadFrom: "2023-12-01",
}
