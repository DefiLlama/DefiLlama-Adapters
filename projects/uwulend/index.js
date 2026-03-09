const { methodology, aaveExports } = require("../helper/aave");
const { stakings } = require("../helper/staking");

const PoolV1 = "0x7c0bF1108935e7105E218BBB4f670E5942c5e237";
const PoolV2 = "0x0a7B2A21027F92243C5e5E777aa30BB7969b0188";

const SLP = "0x3E04863DBa602713Bb5d0edbf7DB7C3A9A2B6027";

module.exports = {
    methodology,
  ethereum: {
    ...aaveExports(undefined, '0xaC538416BA7438c773F29cF58afdc542fDcABEd4', undefined, undefined, {blacklistedTokens: ['0x8dd09822e83313adca54c75696ae80c5429697ff'] }),
    pool2: stakings([PoolV1, PoolV2], [SLP]),
  },
};
