const { sumTokensExport } = require('../helper/unwrapLPs');

const owner = "0x8D5b64b8D8904E4aEc79F10468F347534D2A1b79"; // vault address
const tokens = ["0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA"]; // USDC

module.exports = {
  base: {
    tvl: sumTokensExport({ owner, tokens }),
  },
};
