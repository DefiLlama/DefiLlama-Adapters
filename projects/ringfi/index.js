const { staking } = require('../helper/staking')
const owner = "0x59AE8c783eBCe3CC68ccE32C427128101fa4C405";
const target = "0x021988d2c89b1A9Ff56641b2F247942358FF05c9";

module.exports = {
    bsc: {
        tvl: () => ({}),
        staking: staking(owner, target),
      },
    methodology: "We count all RING deposited into wRING contract",
};


module.exports.deadFrom = '2023-05-09'