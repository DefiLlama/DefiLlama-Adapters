const { getCuratorExport } = require("../helper/curators");

const configs = {
  methodology: 'Count all assets are deposited in all vaults curated by MEV Capital.',
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
      mellow: [
        '0x5fD13359Ba15A84B76f7F87568309040176167cd',
      ],
      symbiotic: [
        '0x4e0554959A631B3D3938ffC158e0a7b2124aF9c5',
        '0xdC47953c816531a8CA9E1D461AB53687d48EEA26',
        '0x9205c82D529A79B941A9dF2f621a160891F57a0d',
        '0xF60E6E6d8648FdBC2834EF7bC6f5E49aB55bec31',
        '0x3b512427ca6345e67101ECcb78D9c8508714818c',
        '0xD25f31806de8d608D05DfeAEB1140C1D365864B3',
        '0x3cA7d72637FB8A5761AD75FBDA248E007800d75a',
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
