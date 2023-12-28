const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk');

const abi = require('../dforce/abi.json');
const { compoundExports2 } = require('../helper/compound')
const { generalizedChainExports } = require('../helper/exports')

let allControllers = {
  ethereum: ["0x8B53Ab2c0Df3230EA327017C91Eb909f815Ad113"],
  bsc: ["0x0b53E608bD058Bb54748C35148484fD627E6dc0A"],
  arbitrum: ["0x8E7e9eA9023B81457Ae7E6D2a51b003D421E5408"],
  optimism: ["0xA300A84D8970718Dac32f54F61Bd568142d8BCF4"],
  polygon: ["0x52eaCd19E38D501D006D2023C813d7E37F025f37"],
  conflux: ["0xA377eCF53253275125D0a150aF195186271f6a56"]
};

let yieldMarkets = {
  ethereum: [
    "0x02285AcaafEB533e03A7306C55EC031297df9224", // dDAI
    "0x109917F7C3b6174096f9E1744e41ac073b3E1F72", // dUSDx
    "0x16c9cF62d8daC4a38FB50Ae5fa5d51E9170F3179", // dUSDC
    "0x868277d475E0e475E38EC5CdA2d9C83B5E1D9fc8" // dUSDT
  ],
  bsc: [
    "0xce14792a280b20c4f8E1ae76805a6dfBe95729f5", // dBUSD
    "0x4E0B5BaFC52D09A8F18eA0b7a6A7dc23A1096f99", // dDAI
    "0x6c0F322442D10269Dd557C6e3A56dCC3a1198524", // dUSDC
    "0x6199cC917C12E4735B4e9cEfbe29E9F0F75Af9E5" // dUSDT
  ]
};

const excludeAlliTokens = {
  ethereum: [
    "0x1adc34af68e970a93062b67344269fd341979eb0", // General pool USX
    "0x44c324970e5cbc5d4c3f3b7604cbc6640c2dcfbf", // General pool EUX
    "0xb986f3a2d91d3704dc974a24fb735dcc5e3c1e70", // General pool EUX
    "0xf54954ba7e3cdfda23941753b48039ab5192aea0", // Stock pool USX
    "0xab9c8c81228abd4687078ebda5ae236789b08673", // Stock pool EUX
    "0xa5d65e3bd7411d409ec2ccfa30c6511ba8a99d2b", // Liqee qUSX
    "0x4c3f88a792325ad51d8c446e1815da10da3d184c" // Liqee iMUSX
  ],
  // Optimism
  optimism: [
    "0x7e7e1d8757b241aa6791c089314604027544ce43" // iUSX
  ],
  // BNB-Chain
  bsc: [
    "0x463e3d1e01d048fdf872710f7f3745b5cdf50d0e",
    "0x367c17d19fcd0f7746764455497d63c8e8b2bba3",
    "0x20ecc92f0a33e16e8cf0417dfc3f586cf597f3a9",
    "0xb5102cee1528ce2c760893034a4603663495fd72", // iUSX
    "0x7b933e1c1f44be9fb111d87501baada7c8518abe", // General pool USX
    "0x983a727aa3491ab251780a13acb5e876d3f2b1d8", // General pool EUX
    "0x911f90e98d5c5c3a3b0c6c37bf6ea46d15ea6466", // Stock pool USX
    "0x8af4f25019e00c64b5c9d4a49d71464d411c2199", // Stock pool EUX
    "0x450e09a303aa4bcc518b5f74dd00433bd9555a77", // Liqee qUSX
    "0xee0d3450b577743eee2793c0ec6d59361eb9a454" // Liqee iMUSX
  ],
  // Polygon
  polygon: [
    "0xc171ebe1a2873f042f1dddd9327d00527ca29882", // iUSX
    "0x448bbbdb706cd0a6ab74fa3d1157e7a33dd3a4a8"
  ],
  // Arbitrum
  arbitrum: [
    "0x0385f851060c09a552f1a28ea3f612660256cbaa", // iUSX
    "0x5675546eb94c2c256e6d7c3f7dcab59bea3b0b8b", // iEUX
    "0xc2125882318d04d266720b598d620f28222f3abd" // iEUX
  ],
  avax: [
    "0x73c01b355f2147e5ff315680e068354d6344eb0b" // iUSX
  ],
  kava: [
    "0x9787af345e765a3fbf0f881c49f8a6830d94a514" // iUSX
  ],
  conflux: [
    "0x6f87b39a2e36F205706921d81a6861B655db6358" // iUSX
  ]
};

const USXs = {
  "ethereum": ADDRESSES.ethereum.USX,
  "bsc": "0xb5102cee1528ce2c760893034a4603663495fd72",
  "arbitrum": "0x641441c631e2f909700d2f41fd87f0aa6a6b4edb",
  "polygon": "0xCf66EB3D546F0415b368d98A95EAF56DeD7aA752",
  "avax": "0x853ea32391AaA14c112C645FD20BA389aB25C5e0",
  "kava": ADDRESSES.kava.USX,
  "conflux": "0x422a86f57b6b6F1e557d406331c25EEeD075E7aA"
};


function getLendingTvl(chain, borrowed) {
  const controllers = allControllers[chain]
  const blacklistedTokens = excludeAlliTokens[chain]
  if (USXs[chain])
    blacklistedTokens.push(USXs[chain])
  if (yieldMarkets[chain])
    blacklistedTokens.push(...yieldMarkets[chain])

  const res = controllers.map(comptroller => compoundExports2({
    comptroller, abis: { getAllMarkets: abi['getAlliTokens'] }, blacklistedTokens,
  })).map(i => borrowed ? i.borrowed : i.tvl)
  return sdk.util.sumChainTvls(res)
}

function chainTvl(chain) {
  return {
    tvl: getLendingTvl(chain, false),
    borrowed: getLendingTvl(chain, true),
  };
}


module.exports = {
  ...generalizedChainExports(chainTvl, Object.keys(allControllers)),
  start: 1564165044, // Jul-27-2019 02:17:24 AM +UTC
}
