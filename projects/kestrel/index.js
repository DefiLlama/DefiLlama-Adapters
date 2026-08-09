const { Program } = require("@coral-xyz/anchor");
const { PublicKey } = require("@solana/web3.js");
const { getProvider } = require("../helper/solana");

const PROGRAM_ID = new PublicKey("LYC8YiiSzQfPpxUW2tpxfuPKGZwywAJhXKUfDP2B66f");
const TVL_USD_DECIMALS = 8;

async function tvl(api) {
  const provider = getProvider("solana");
  const idl = await Program.fetchIdl(PROGRAM_ID, provider);
  if (!idl) throw new Error("Unable to fetch the Long Yield Carry program IDL");

  const program = new Program(idl, provider);
  const tokens = await program.account.token.all();
  const totalTvlUsd = tokens.reduce(
    (sum, { account }) => sum + BigInt(account.accounting.tvlUsd.toString()),
    0n,
  );

  api.addUSDValue(Number(totalTvlUsd) / 10 ** TVL_USD_DECIMALS);
}

module.exports = {
  timetravel: false,
  doublecounted: true,
  misrepresentedTokens: true,
  methodology:
    "TVL is the sum of the USD-denominated on-chain accounting value for every Token account owned by Kestrel's Long Yield Carry program.",
  solana: { tvl },
};
