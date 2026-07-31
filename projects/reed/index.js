const { sumTokens2 } = require("../helper/chain/cardano");

const M_SCRIPT_CRED =
  "script163jxg6ejex04jpsu9jc3dlw7u2we4u60zmlle6wdenvfga0pw26";

const REE_ASSET_ID =
  "e7befada6a028d4bd20ae87edecf1ca04d65a1ff57b9f84f0d9847d2524545";

async function tvl() {
  return sumTokens2({
    scripts: [M_SCRIPT_CRED],
    blacklistedTokens: [REE_ASSET_ID],
  });
}

module.exports = {
  timetravel: false,
  methodology:
    "Counts ADA locked in reed's m position validator smart contract on Cardano. REE utility tokens are excluded as non-circulating.",
  cardano: { tvl },
};
