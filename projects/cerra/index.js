const { sumTokens2 } = require("../helper/chain/cardano");

const LENDING_SCRIPT = "addr1z878lgw0676mfkusf0f2h9wl3w5q2zu0klrlcamv6g2werc0pqnxu0fg7wvwgjtgzvg6lg6avzczmwf84aclygrvlkhqfmh5zc";
const AMM_SCRIPT = "addr1zyl8u7cw93g99g2e68cq3k27ad7rd8p6yy3yg9vesgahrus0pqnxu0fg7wvwgjtgzvg6lg6avzczmwf84aclygrvlkhq2a0paj";

async function tvl() {
  return sumTokens2({ scripts: [LENDING_SCRIPT, AMM_SCRIPT] })
}

module.exports = {
  timetravel: false,
  cardano: {
    tvl,
  }
};
