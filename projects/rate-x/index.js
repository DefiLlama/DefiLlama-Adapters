const { sumTokens2, getConnection, runInChunks } = require("../helper/solana");
const { PublicKey } = require("@solana/web3.js");

const TOKEN_PROGRAM_ID = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
// Published by RateX; lists the vault token accounts of every market.
const LOOKUP_TABLE = new PublicKey("eP8LuPmLaF1wavSbaB4gbDAZ8vENqfWCL5KaJ2BRVyV");

/*
 * The lookup table is a snapshot, not a live view: a vault token account opened after the table was last
 * extended is never counted. For the ONyc market that is most of the balance, 5 of its 7 accounts are
 * listed and the two that are missing hold the larger amounts.
 *
 * So read the table for the (vault authority, mint) pairs it sanctions, then sum those pairs' token
 * accounts live (sumTokens2 queries getTokenAccountsByOwner per [mint, owner] pair). A market's new
 * account is counted as soon as it is funded, while the set of assets that count stays exactly the one
 * the table already defines. Restricting to sanctioned pairs keeps out unrelated airdropped mints and
 * RateX's own u64::MAX-supply synthetic tokens held by the same vault authorities.
 */
async function solanaTvl(api) {
  const connection = getConnection();
  const lookupTable = (await connection.getAddressLookupTable(LOOKUP_TABLE)).value;
  if (!lookupTable) throw new Error("RateX lookup table not found");

  const listed = [...new Set(lookupTable.state.addresses.map((address) => address.toBase58()))]
    .map((address) => new PublicKey(address));
  const accounts = await runInChunks(
    listed,
    (chunk) => connection.getMultipleParsedAccounts(chunk).then(({ value }) => value),
    { sleepTime: 200 }
  );

  const tokensAndOwners = accounts
    .filter((account) => account?.owner?.toBase58() === TOKEN_PROGRAM_ID && account.data?.parsed?.type === "account")
    .map(({ data }) => [data.parsed.info.mint, data.parsed.info.owner])
    .filter(([mint, owner]) => mint && owner);

  if (!tokensAndOwners.length) throw new Error("RateX lookup table held no vault token accounts");
  return sumTokens2({ api, tokensAndOwners });
}

async function bscTvl(api) {
  return api.sumTokens({ tokensAndOwners: [["0x77c9b49a58325131D08F9dC120388f20c57c2572", "0xEDBcdD0A45Fd8EBa749fFc10205c65CeA54336D5"]] })
}

module.exports = {
  timetravel: false,
  methodology: "TVL is the collateral in RateX market vaults. The RateX lookup table defines which (vault authority, mint) pairs count, and those pairs' token accounts are read on-chain so accounts opened after the table was last extended are still included.",
  solana: { tvl: solanaTvl },
  bsc: { tvl: bscTvl }
};
