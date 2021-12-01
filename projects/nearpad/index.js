const { calculateUsdUniTvl } = require("../helper/getUsdUniTvl");

const tokens = [
  "0x885f8CF6E45bdd3fdcDc644efdcd0AC93880c781",
  "0xC9BdeEd33CD01541e1eeD10f90519d2C06Fe3feB",
  "0xC42C30aC6Cc15faC9bD938618BcaA1a1FaE8501d",
  "0x4988a896b1227218e4A686fdE5EabdcAbd91571f",
  "0xe3520349F477A5F6EB06107066048508498A291b",
  "0xB12BFcA5A55806AaF64E99521918A4bf0fC40802",
  "0xF4eB217Ba2454613b15dBdea6e5f22276410e89e",
  "0x8BEc47865aDe3B172A928df8f990Bc7f2A3b9f79",
  "0xFa94348467f64D5A457F75F8bc40495D33c65aBB",
  "0x74974575d2f1668c63036d51ff48dbaa68e52408",
  "0xdcD6D4e2B3e1D1E1E6Fa8C21C8A323DcbecfF970",
  "0xDA2585430fEf327aD8ee44Af8F1f989a2A91A3d2",
];

module.exports = {
  misrepresentedTokens: true,
  aurora: {
    tvl: calculateUsdUniTvl(
      "0x34484b4E416f5d4B45D4Add0B6eF6Ca08FcED8f1", // factory
      "aurora", // chain
      "0xC9BdeEd33CD01541e1eeD10f90519d2C06Fe3feB", // coreAssetRaw
      tokens, // whitelistRaw
      "weth" // coreAssetName
    ),
  },
};

// node test.js projects/nearpad/index.js
