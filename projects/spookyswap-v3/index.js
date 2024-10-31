const { uniV3Export } = require("../helper/uniswapV3");

const factory = "0x7928a2c48754501f3a8064765ECaE541daE5c3E6";
const factory_bttc = "0xE12b00681dD2e90f51d9Edf55CE1A7D171338165";

module.exports = uniV3Export({
    fantom: { factory, fromBlock: 70992836, blacklistedTokens:['0x6e5e3ce13e2c7d4de000f93c4909164d0aa59f0b'] },
    //eon: { factory, fromBlock: 679684 },
    bittorrent: { factory: factory_bttc, fromBlock: 26441276 },
})
