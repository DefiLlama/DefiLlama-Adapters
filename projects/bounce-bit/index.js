const { sumTokensExport } = require('../helper/sumTokens');
const ADDRESSES = require('../helper/coreAssets.json')

module.exports = {
  methodology: "Staking tokens via BounceBit counts as TVL",
  ethereum: {
    tvl: sumTokensExport({
      owners: ["0x53C58E975f3F72162Fc0509b9742c9b55E24a599", "0xa318dc13107efa77b3dbdc35b87ddd79b33e1139", "0xD08426542212c2Bc2B3fADFb9529E7dBD14B86Ba"],
      tokens: [ADDRESSES.ethereum.WBTC, ADDRESSES.ethereum.USDT, '0xA9B1Eb5908CfC3cdf91F9B8B3a74108598009096', "0x38e382F74dfb84608F3C1F10187f6bEf5951DE93", "0x1981E32C2154936741aB6541a737b87C68F13cE1"] // auction mubi DAII
    }),
  },
  bsc: {
    tvl: sumTokensExport({
      owners: ["0x53C58E975f3F72162Fc0509b9742c9b55E24a599", "0x9d0e151414aAA3913f22ac95B9c6377Ea7826F08"],
      tokens: [ADDRESSES.bsc.BTCB, ADDRESSES.ethereum.FDUSD] // BTCB FDUSD
    }),
  },
  tron: {
    tvl: sumTokensExport({
      owners: ["TMNgo1318CLLqxRjeHVstYD6kLKDvAhR56", "TFoNA5yPfckPUHTxVHoK9uTPdE9AUKFLZC"],
      tokens: [ADDRESSES.tron.BTC]
    }),
  },
};
