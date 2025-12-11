const { sumTokens2 } = require("../helper/solana");

async function tvl() {
  return sumTokens2({
    tokenAccounts: [
      // Hylo Reserves jitoSOL token account
      "2Y3TLkdGoJwbdizxqrZmQwNLYJyGKTgzC4tbetbkvQ43",
      // Hylo Reserve hyloSOL token account
      "7VNBQCDKt4cxLWW51suV8a6VAYC4R66CfyySiYJek7Rj",
    ]
  })
}

module.exports = {
  timetravel: false,
  doublecounted: true,
  solana: { tvl },
  methodology: 'TVL is calculated by summing all LSTs locked in Hylo protocol.',
};
