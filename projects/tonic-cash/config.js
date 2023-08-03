const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress } = require('../helper/unwrapLPs');

module.exports = {
  klaytn: [
    {
      tokens: [nullAddress], // KLAY
      holders: [
        '0x033237b3d6ABCb7d48C5A40Ec3038A53aEc1b77e',
        '0x7b853e8387FC6bcFCAa9BDab8d0479E6c9E6782b',
        '0x457Caf470fB1031530E8cdD06703da7B1BbCCe04',
        '0x9694ea20de96D5E46C8FE1E7975D7a2C7C79Bf2c',
      ],
    },
    {
      tokens: ['0xcee8faf64bb97a73bb51e115aa89c17ffa8dd167'], // oUSDT
      holders: [
        '0x528AE79DAe416bf9623B94fA6Baef0FC3dd12ef8',
        '0xc69C9bBabEDE59562Cd8a6F92Fa50aFf10D8310e',
        '0x503d6D4E14A2A4f78f4c3E51c94F1F53C6bd6D96',
        '0x804aA592f7bF0B7EB98db08825D1106eC4822fb3',
      ],
    },
    {
      tokens: ['0x34d21b1e550d73cee41151c77f3c73359527a396'], // oETH
      holders: [
        '0x70D8D865d556f7D03c463e296ac706CE11B73d4B',
        '0x402f2297f15b6fc9415D6F193ae882a3879b5F09',
        '0xCFa2494dddB338c2fd15224B4Eb9668a5C4de695',
        '0xD10aaD96548CAa7874e435Db0d9676b64554092b',
      ],
    },
  ],
  wemix: [
    {
      tokens: [nullAddress], // WEMIX
      holders: [
        '0x033237b3d6ABCb7d48C5A40Ec3038A53aEc1b77e',
        '0x7b853e8387FC6bcFCAa9BDab8d0479E6c9E6782b',
        '0x457Caf470fB1031530E8cdD06703da7B1BbCCe04',
        '0x9694ea20de96D5E46C8FE1E7975D7a2C7C79Bf2c',
      ],
    },
    {
      tokens: [ADDRESSES.wemix.WEMIX_], // WEMIXDollar
      holders: [
        '0x144120Ef18d4223Ab3f4695653a5755C23FBF469',
        '0xc978f195C838d3344f74DDBA84235130B3091847',
        '0xeD4a38cC990a6E5D817C9d89677c886994803d38',
        '0xAc04FDbADd7CF8d4BaD0F957d37e3fd0c093A9B6',
      ],
    },
    {
      tokens: [ADDRESSES.shiden.ETH], // ETH
      holders: [
        '0x2D3bAeBa85D78D202887D34f5618380e90F3c272',
        '0xD2510D275dbca0fe333dAff8Eb51b9105f6aC212',
        '0xE1d1c5094d5eEF16E0207834b2E5FDf634278217',
        '0xfF30E4d7ec19a45710049033d1E51C1a6848E1FA',
      ],
    },
  ],
};
