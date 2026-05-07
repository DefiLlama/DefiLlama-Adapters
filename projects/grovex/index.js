
const { cexExports } = require("../helper/cex");

const config = {
  // grx: {  // exclude own chain/tokens from the PoR
  //   owners: [
  //     "0xdb9011614cc30136af7ebba4e314641e07c10221",
  //     "0x7ee04cd7187D9EDb18646e58168bAbB9CEF75923"
  //   ],
  // },
  ethereum: {
    owners: [
      "0x79b5a2d395db1711a6e6c42a95eb48710276f666"
    ],
  },
  avax: {
    owners: [
      "0x79b5a2d395db1711a6e6c42a95eb48710276f666"
    ],
  },
  bsc: {
    owners: [
      "0x79b5a2d395db1711a6e6c42a95eb48710276f666"
    ],
  },
  polygon: {
    owners: [
      "0x79b5a2d395db1711a6e6c42a95eb48710276f666"
    ],
  },
  base: {
    owners: [
      "0x79b5a2d395db1711a6e6c42a95eb48710276f666"
    ],
  },
    arbitrum: {
    owners: [
      "0x79b5a2d395db1711a6e6c42a95eb48710276f666"
    ],
  },
  sonic: {
    owners: [
      "0x79b5a2d395db1711a6e6c42a95eb48710276f666"
    ],
  },
};

module.exports = cexExports(config);
