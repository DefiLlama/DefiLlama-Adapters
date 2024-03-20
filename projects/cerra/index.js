const { sumTokens2 } = require("../helper/chain/cardano");

const LENDING_SCRIPT = "addr1z878lgw0676mfkusf0f2h9wl3w5q2zu0klrlcamv6g2werc0pqnxu0fg7wvwgjtgzvg6lg6avzczmwf84aclygrvlkhqfmh5zc";

async function tvl() {
  return sumTokens2({ scripts: [LENDING_SCRIPT] })
}

module.exports = {
  timetravel: false,
  cardano: {
    tvl,
  }
};
