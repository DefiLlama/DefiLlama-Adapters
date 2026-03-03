
const { cexExports } = require("../helper/cex");

const config = {
  grx: {
    owners: [
      "0xdb9011614cc30136af7ebba4e314641e07c10221",
      "0x7ee04cd7187D9EDb18646e58168bAbB9CEF75923"
    ],
  },
};

module.exports = cexExports(config);