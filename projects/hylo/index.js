const { sumTokens2 } = require("../helper/solana");

async function tvl() {
  return sumTokens2({
    tokenAccounts: [
      // Hylo Reserves jitoSOL token account
      "2Y3TLkdGoJwbdizxqrZmQwNLYJyGKTgzC4tbetbkvQ43",
    ]
  })
}

module.exports = {
  timetravel: false,
  doublecounted: true,
  solana: { tvl },
  methodology: 'TVL is calculated by summing all jitoSOL assets locked in Hylo protocol.',
};
