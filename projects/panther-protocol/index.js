const { stakings } = require("../helper/staking");

const contracts = {
  polygon: {
    core: "0x9A06Db14D639796B25A6ceC6A1bf614fd98815EC",
    staking: [
      "0x4cec451f63dbe47d9da2debe2b734e4cb4000eac",
      "0x5e7fda6d9f5024c4ad1c780839987ab8c76486c9",
    ],
  },
  ethereum: {
    core: "0x909E34d3f6124C324ac83DccA84b74398a6fa173",
    staking: ["0xf4d06d72dacdd8393fa4ea72fdcc10049711f899"],
  },
};

Object.keys(contracts).forEach((chain) => {
  module.exports[chain] = {
    tvl: () => ({}),
    staking: stakings(contracts[chain].staking, contracts[chain].core),
  };
});
