const coreAssets = require('../helper/coreAssets.json');
const { sumLayerZeroEscrows } = require('../helper/layerzero');

const ethereumOAdapterUpgradeable = "0x6C96dE32CEa08842dcc4058c14d3aaAD7Fa41dee";
const ethereumDstEids = [
  30109, 30110, 30111, 30181, 30212, 30274, 30280, 30295, 30316, 30320,
  30322, 30331, 30333, 30339, 30362, 30367, 30383, 30390, 30396, 30398, 30410,
];

module.exports = {
  timetravel: false,
  start: 1736351639,
  ethereum: {
    tvl: sumLayerZeroEscrows({
      escrows: [
        {
          oapp: ethereumOAdapterUpgradeable,
          token: coreAssets.ethereum.USDT,
          owner: ethereumOAdapterUpgradeable,
          dstEids: ethereumDstEids,
        },
      ],
      minDvnQuorum: 3,
    }),
  },
  methodology:
    'Counts USDT locked in the Ethereum USDT0 OAdapter after validating all configured Ethereum send routes with the LayerZero helper. Each route must meet a 3-DVN quorum. Hedera and Tempo source-escrow OApps were observed but currently hold zero USDT0, so they are not included.',
};
