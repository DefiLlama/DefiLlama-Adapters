const { sumTokens, getSolBalance } = require("../helper/solana");
const BigNumber = require("bignumber.js");

// SOL chest owner: https://solscan.io/account/3SGP67y3XAxZivaz2peNTxS6E44cQXErnEMyBXaCeT2n
const SOL_chest_owner = "3SGP67y3XAxZivaz2peNTxS6E44cQXErnEMyBXaCeT2n";
const mSOL = "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So";
const soETH = "2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk";
const soBTC = "9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E";
const soUSDC = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const tokensAndAccounts = [mSOL, soETH, soBTC, soUSDC].map((token) => [
  token,
  SOL_chest_owner,
]);

async function solanaTVL() {
  // Sum Tokens balances
  let balances = await sumTokens(tokensAndAccounts);

  // Get SOL balance as well (not wrapped SOL)
  const solBalance = await getSolBalance(SOL_chest_owner);
  console.log("Chest SOL:", solBalance, ", Chest tokenBalances", balances);
  balances["solana"] = new BigNumber(balances["solana"] || "0").plus(
    new BigNumber(solBalance)
  );

  return balances;
}

module.exports = {
  solana: {
    tvl: solanaTVL,
  },
  methodology: "Summing balances of all chests of chest finance",
};
