const ADDRESSES = require('../helper/coreAssets.json')
const { treasuryExports, nullAddress } = require("../helper/treasury");

const owners = ['0x5da07af8913a4eaf09e5f569c20138b658906c17', '0xf930ebbd05ef8b25b1797b9b2109ddc9b0d43063']

const config = {
  isComplex: true,
  complexOwners: owners,
  ethereum: {
    owners,
    ownTokens: ['0x73968b9a57c6E53d41345FD57a6E6ae27d6CDB2F'],
    tokens: [
      nullAddress,
      ADDRESSES.ethereum.USDC,
      '0x320623b8e4ff03373931769a31fc52a4e78b5d70',
      '0xd1b5651e55d4ceed36251c61c50c889b36f6abb5',
      '0x7448c7456a97769f6cd04f1e83a4a23ccdc46abd'
    ],
  },
  arbitrum: {
    owners: ['0xfdb1157ac847d334b8912df1cd24a93ee22ff3d0', ...owners],
    tokens : [
      nullAddress,
      '0x11cdb42b0eb46d95f990bedd4695a6e3fa034978'
    ],
  },
  bsc: {
    owners,
    tokens: [
      nullAddress,
      '0x8d279274789ccec8af94a430a5996eaace9609a9',
      '0x25d887ce7a35172c62febfd67a1856f20faebb00'
    ],
  },
  base: {
    owners,
    tokens: [
      '0x8e7801bac71e92993f6924e7d767d7dbc5fce0ae',
      '0x8ee73c484a26e0a5df2ee2a4960b789967dd0415',
      '0x6bb7a212910682dcfdbd5bcbb3e28fb4e8da10ee',
      '0xb4444468e444f89e1c2cac2f1d3ee7e336cbd1f5',
      ADDRESSES.optimism.WETH_1
    ],
  },
  polygon: {
    owners,
    ownTokens: ['0x361a5a4993493ce00f61c32d4ecca5512b82ce90'],
    tokens: [
      nullAddress,
    ],
  },
  fraxtal: {}
}

module.exports = treasuryExports(config)