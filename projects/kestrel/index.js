const { Program } = require("@coral-xyz/anchor");
const { PublicKey } = require("@solana/web3.js");
const { getProvider, sumTokens2 } = require("../helper/solana");

const PROGRAM_ID = new PublicKey("LYC8YiiSzQfPpxUW2tpxfuPKGZwywAJhXKUfDP2B66f");
const USD_DECIMALS = 8;
const ZERO = "11111111111111111111111111111111";

async function tvl(api) {
  const provider = getProvider("solana");
  const idl = await Program.fetchIdl(PROGRAM_ID, provider);
  if (!idl) throw new Error("Unable to fetch the Long Yield Carry program IDL");

  const program = new Program(idl, provider);
  const tokens = await program.account.token.all();

  // idle collateral
  await sumTokens2({
    api,
    owners: tokens.map((t) => t.publicKey.toString()),
    tokens: [...new Set(tokens.map((t) => t.account.collateral.mint.toString()))],
  });

  for (const { account } of tokens) {
    const collateralMint = account.collateral.mint.toString();

    for (const lp of account.lendingPositions) {
      const collateral = lp.accounting.collateral.toString();
      if (collateral !== "0") api.add(collateralMint, collateral);
      const debt = lp.accounting.debt;
      if (debt.mint.toString() !== ZERO && debt.amount.toString() !== "0")
        api.add(debt.mint.toString(), "-" + debt.amount.toString());
    }

    for (const dc of account.debtCarry)
      if (dc.tvlUsd.toString() !== "0")
        api.addUSDValue(Number(dc.tvlUsd.toString()) / 10 ** USD_DECIMALS);
  }
}

module.exports = {
  timetravel: false,
  doublecounted: true,
  misrepresentedTokens: true,
  methodology: "TVL is the net value of every Long Yield Carry vault: collateral held idle and deposited in lending platforms (Kamino/Marginfi) minus the stable debt borrowed against it plus the redeployed yield position.",
  solana: { tvl },
};
