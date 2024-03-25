const { sumTokensExport, nullAddress } = require("../helper/unwrapLPs");

const owners = [
  0x9eb71114b8cccd2b2c6097cf8c64e85c5d79d2a3,
  0x317ba03ff33947f029ead2eb1bf0c028b7c88790,
  0x8a479652dfb684c3cc2281723d951b925f3913e8,
];

const config = {
  base: {
    tokens: [
      0xac1bd2486aaf3b5c0fc3fd868558b082a531b2b4,
      0x4ed4e862860bed51a9570b96d89af5e1b0efefed,
      0x91f45aa2bde7393e0af1cc674ffe75d746b93567,
      0x9e53e88dcff56d3062510a745952dec4cefdff9e,
      0xf6e932ca12afa26665dc4dde7e27be02a7c02e50,
      0x351b134d80baa54fd2c208b8bca5fd1ba06d5f9a,
      0x6921b130d297cc43754afba22e5eac0fbf8db75b,
      0x4e0826efdeb7480ec91f6388de310450808c86c7,
      0x833589fcd6edb6e08f4c7c32d4f71b54bda02913,
      0x50c5725949a6f0c72e6c4a641f24049a917db0cb,
      0x4ff77748e723f0d7b161f90b4bc505187226ed0d,
      0x4e496c0256fb9d4cc7ba2fdf931bc9cbb7731660,
      0xafb89a09d82fbde58f18ac6437b3fc81724e4df6,
      0xa19328fb05ce6fd204d16c2a2a98f7cf434c12f4,
      0x4cd2bd5229b06e74613ed918c431277010b6ee9e,
      0xfea9dcdc9e23a9068bf557ad5b186675c61d33ea,
      0x9a3b7959e998bf2b50ef1969067d623877050d92,
      0x532f27101965dd16442e59d40670faf5ebb142e4,
      0x76be4f63efd2a0ba1c949b8b430413e64c59806a,
      nullAddress,
    ],
  },
};

module.exports = {};

Object.keys(config).forEach((chain) => {
  const { tokens } = config[chain];
  module.exports[chain] = {
    tvl: sumTokensExport({ owners, tokens }),
  };
});
