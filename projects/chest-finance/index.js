const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2, } = require("../helper/solana");

// SOL chest owner: https://solscan.io/account/3SGP67y3XAxZivaz2peNTxS6E44cQXErnEMyBXaCeT2n
const SOL_chest_owner = "3SGP67y3XAxZivaz2peNTxS6E44cQXErnEMyBXaCeT2n";
const mSOL = "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So";
const soETH = "2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk";
const BTC = "9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E";
const USDC = ADDRESSES.solana.USDC;
const CASH = "CASHVDm2wsJXfhj6VWxb7GiMdoLc17Du7paH4bNr5woT";

async function solanaTVL() {
  return sumTokens2({ tokens: [mSOL, soETH, BTC, USDC, CASH], owner: SOL_chest_owner, solOwners: [SOL_chest_owner]});
}

module.exports = {
  solana: {
    tvl: solanaTVL,
  },
  methodology: "Summing balances of all chests of chest finance",
};
