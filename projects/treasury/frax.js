const ADDRESSES = require('../helper/coreAssets.json');
const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0x9AA7Db8E488eE3ffCC9CdFD4f2EaECC8ABeDCB48";
const fpis = "0xc2544A32872A91F4A553b404C6950e89De901fdb";
const fxs = "0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0";
const treasuryarb = "0xe61d9ed1e5dc261d1e90a99304fadcef2c76fd10"

module.exports = treasuryExports({
  ethereum: {
    tokens: [
      nullAddress,
      ADDRESSES.ethereum.SAFE,
    ],
    owners: [
      treasury, 
      '0x63278bF9AcdFC9fA65CFa2940b89A34ADfbCb4A1',
      '0x8D4392F55bC76A046E443eb3bab99887F4366BB0',
      '0xa95f86fE0409030136D6b82491822B3D70F890b3',
      '0x9AA7Db8E488eE3ffCC9CdFD4f2EaECC8ABeDCB48',
      '0x874a873e4891fB760EdFDae0D26cA2c00922C404',
    ],
    ownTokens: [fpis, fxs, ADDRESSES.ethereum.FRAX],
  },
  arbitrum: {
    tokens: [
      nullAddress,
    ],
    owners: [
      treasuryarb, 
    ],
  },
});
