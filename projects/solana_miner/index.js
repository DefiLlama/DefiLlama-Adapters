const { sumTokens2 } = require("../helper/solana");

async function tvl() {
  return sumTokens2({ solOwners: ['HitZJAWpuxC86WnxG64r7dntfo1eK4Aj8KRCnttqcB2Y']})
}

module.exports = {
  hallmarks: [
    [1704834000, "Rug Pull"]
  ],
  deadFrom: 1704834000,
  timetravel: false,
  methodology:
    "Solana Miner is designed to provide a user-friendly mining experience, minimizing technical barriers and facilitating newcomers. Our product focuses not only on building a community but also on delivering passive income for investors. See more: https://solanaminer.xyz",
  solana: { tvl },
};
