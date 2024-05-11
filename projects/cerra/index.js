const { sumTokens2 } = require("../helper/chain/cardano");

const LENDING_SCRIPT = "addr1z878lgw0676mfkusf0f2h9wl3w5q2zu0klrlcamv6g2werc0pqnxu0fg7wvwgjtgzvg6lg6avzczmwf84aclygrvlkhqfmh5zc";
const AMM_SCRIPT = "addr1zyl8u7cw93g99g2e68cq3k27ad7rd8p6yy3yg9vesgahrus0pqnxu0fg7wvwgjtgzvg6lg6avzczmwf84aclygrvlkhq2a0paj";
const BATCHER_SCRIPT = "addr_test1wpw0ds4d59mlr639ya84guh3p8nzyxxmh5cdk6x8fz35agsmnawle";

async function tvl() {
  return sumTokens2({ scripts: [LENDING_SCRIPT, AMM_SCRIPT, BATCHER_SCRIPT] })
}

module.exports = {
  timetravel: false,
  cardano: {
    tvl,
  }
};
