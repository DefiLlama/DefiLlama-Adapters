const { sumTokensExport } = require('../helper/sumTokens');
const ADDRESSES = require('../helper/coreAssets.json')

module.exports = {
  methodology: "Staking tokens via BounceBit counts as TVL",
  ethereum: {
    tvl: sumTokensExport({
      owners: ["0x53C58E975f3F72162Fc0509b9742c9b55E24a599", "0xa318dc13107efa77b3dbdc35b87ddd79b33e1139"],
      tokens: [ADDRESSES.ethereum.WBTC, ADDRESSES.ethereum.USDT]
    }),
  },
  bsc: {
    tvl: sumTokensExport({
      owners: ["0x53C58E975f3F72162Fc0509b9742c9b55E24a599", "0x9d0e151414aAA3913f22ac95B9c6377Ea7826F08"],
      tokens: [ADDRESSES.bsc.BTCB, '0xc5f0f7b66764F6ec8C8Dff7BA683102295E16409'] // BTCB FDUSD
    }),
  },
  tron: {
    tvl: sumTokensExport({
      owners: ["TMNgo1318CLLqxRjeHVstYD6kLKDvAhR56", "TFoNA5yPfckPUHTxVHoK9uTPdE9AUKFLZC"],
      tokens: [ADDRESSES.tron.BTC]
    }),
  },
};
