const { getCuratorExport } = require("../helper/curators");

const configs = {
  methodology: 'Count all assets are depoisted in all vaults curated by MEV Capital.',
  blockchains: {
    ethereum: {
      morphoVaultOwners: [
        '0x06590Fef209Ebc1f8eEF83dA05984cD4eFf0d0E3',
        '0x650741eB4f6AB0776B9bF98A3280E3Cd6A2F1BF1',
        '0x6fA5d361Ab8165347F636217001E22a7cEF09B48',
      ],
      eulerVaultOwners: [
        '0xF1B4Ad34B4DbBAab120e4A04Eb3D3707Ea41b6eb',
        '0x6293e97900aA987Cf3Cbd419e0D5Ba43ebfA91c1',
      ],
    },
    sonic: {
      eulerVaultOwners: [
        '0xb1a084b03a75f4bBb895b91BF1f5E9615A28F17D',
        '0xB672Ea44A1EC692A9Baf851dC90a1Ee3DB25F1C4',
        '0x6293e97900aA987Cf3Cbd419e0D5Ba43ebfA91c1',
        '0x3fEcc0d59BF024De157996914e548047ec0ccCE5',
      ],
    },
    berachain: {
      eulerVaultOwners: [
        '0xd93A628567a93031A8aC63fd426Ae9fb80Ce7bb2',
        '0xb1a084b03a75f4bBb895b91BF1f5E9615A28F17D',
        '0x18d23B961b11079EcD499c0EAD8E4F347e4d3A66',
      ],
    },
    avax: {
      eulerVaultOwners: [
        '0xa16a6eCE1F7DdE85026bf66DdE03a2746E9EA3BE',
      ],
    },
    bob: {
      eulerVaultOwners: [
        '0xc1452E2C136B9e6b307862428c84AeB8829adf29',
      ],
    },
    bsc: {
      eulerVaultOwners: [
        '0xC6ac2365C94f007fB3f682F48c7Db9c36d4FA6df',
      ],
    },
  }
}

module.exports = getCuratorExport(configs)
