const { staking } = require("../helper/staking");

const treasury = "0xb20234c33337537111f4ab6f5EcaD400134aC143";
const WCRO = "0x5c7f8a570d578ed84e63fdfa7b1ee72deae1ae23";

module.exports = {
  cronos: {
    tvl: staking(treasury, WCRO),
  },
};
