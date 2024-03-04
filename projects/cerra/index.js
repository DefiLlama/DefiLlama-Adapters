const { sumTokens2 } = require("../helper/chain/cardano");

const LENDING_SCRIPT = "addr1zy7d8hd6httaxc5xgtqsgcazdj0ughe2p534ns5lgh66jus0pqnxu0fg7wvwgjtgzvg6lg6avzczmwf84aclygrvlkhqlkdnye";

async function tvl() {
  return sumTokens2({ scripts: [LENDING_SCRIPT] })
}

module.exports = {
  timetravel: false,
  cardano: {
    tvl,
  }
};
