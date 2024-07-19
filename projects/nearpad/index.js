const ADDRESSES = require('../helper/coreAssets.json')
const { getUniTVL } = require('../helper/unknownTokens')

const tokens = [
  "0x885f8CF6E45bdd3fdcDc644efdcd0AC93880c781",
  "0xC9BdeEd33CD01541e1eeD10f90519d2C06Fe3feB",
  ADDRESSES.aurora.NEAR,
  ADDRESSES.aurora.USDT_e,
  "0xe3520349F477A5F6EB06107066048508498A291b",
  ADDRESSES.aurora.USDC_e,
  "0xF4eB217Ba2454613b15dBdea6e5f22276410e89e",
  ADDRESSES.aurora.AURORA,
  "0xFa94348467f64D5A457F75F8bc40495D33c65aBB",
  "0x74974575d2f1668c63036d51ff48dbaa68e52408",
  "0xdcD6D4e2B3e1D1E1E6Fa8C21C8A323DcbecfF970",
  ADDRESSES.aurora.FRAX,
];


module.exports = {
  misrepresentedTokens: true,
  aurora: {
    tvl: getUniTVL({ factory: '0x34484b4E416f5d4B45D4Add0B6eF6Ca08FcED8f1', useDefaultCoreAssets: true }),
  },
};
// node test.js projects/nearpad/index.js
