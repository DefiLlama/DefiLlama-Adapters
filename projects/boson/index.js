const { staking } = require("../helper/staking");

module.exports = {
  ethereum: {
    tvl: () => ({}),
    staking: staking(
      [
        "0x6244bc0d4b661526c0c62c3610571cd1ac9df2dd",
        "0xbacc083795846a67b0782327a96622447ddafe6c",
        "0x081a52f02e51978ad419dd7894d7ae3555f8bc26",
        "0x3ed0c99c8e8eb94438837cc8a08ca3bb187424cf",
        "0x3810d9d6685812af6ef4257de0542ecdba9bfd95"
      ],
      "0xC477D038d5420C6A9e0b031712f61c5120090de9"
    ),
  },
};
