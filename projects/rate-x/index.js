const { getConnection, runInChunks } = require("../helper/solana");
const { PublicKey } = require("@solana/web3.js");

const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
// Published by RateX; lists the vault token accounts of every market.
const LOOKUP_TABLE = new PublicKey("eP8LuPmLaF1wavSbaB4gbDAZ8vENqfWCL5KaJ2BRVyV");
const SLEEP_TIME = 200;

const parsedTokenAccount = (account) => {
  if (!account || !account.owner.equals(TOKEN_PROGRAM_ID)) return null;
  if (account.data?.parsed?.type !== "account") return null;
  const info = account.data.parsed.info;
  return info?.owner && info?.mint ? info : null;
};

/*
 * The lookup table is a snapshot, not a live view: a vault token account opened after the table was last
 * extended is never counted. For the ONyc market that is most of the balance, 5 of its 7 accounts are
 * listed and the two that are missing hold the larger amounts.
 *
 * So read the table for the (vault authority, mint) pairs it sanctions, then take those pairs' token
 * accounts live. A market's new account is counted as soon as it is funded, while the set of assets that
 * count stays exactly the one the table already defines.
 *
 * The restriction to sanctioned pairs is what makes this safe. Summing every token account of a vault
 * authority instead pulls in whatever else has been sent to it, and today that would add 19.9M units of a
 * pump.fun mint that no vault ever held, alongside RateX's own synthetic tokens, whose u64::MAX supplies
 * would dwarf the real collateral.
 */
async function getSanctionedVaultPairs(connection) {
  const lookupTable = (await connection.getAddressLookupTable(LOOKUP_TABLE)).value;
  if (!lookupTable) throw new Error("RateX lookup table not found");

  const listed = [...new Set(lookupTable.state.addresses.map((address) => address.toBase58()))]
    .map((address) => new PublicKey(address));
  const accounts = await runInChunks(
    listed,
    (chunk) => connection.getMultipleParsedAccounts(chunk).then(({ value }) => value),
    { sleepTime: SLEEP_TIME }
  );

  const authorities = new Set();
  const pairs = new Set();
  accounts.forEach((account) => {
    const info = parsedTokenAccount(account);
    if (!info) return;
    authorities.add(info.owner);
    pairs.add(`${info.owner}:${info.mint}`);
  });

  if (pairs.size === 0) throw new Error("RateX lookup table held no vault token accounts");
  return { authorities: [...authorities], pairs };
}

async function solanaTvl(api) {
  const connection = getConnection();
  const { authorities, pairs } = await getSanctionedVaultPairs(connection);

  // One request per authority, run a few at a time so the adapter stays inside RPC rate limits.
  const holdings = await runInChunks(
    authorities,
    (chunk) => Promise.all(chunk.map((authority) => connection
      .getParsedTokenAccountsByOwner(new PublicKey(authority), { programId: TOKEN_PROGRAM_ID })
      .then(({ value }) => value.map(({ account }) => account.data.parsed.info)))),
    { chunkSize: 5, sleepTime: SLEEP_TIME }
  );

  holdings.flat().forEach((info) => {
    if (!pairs.has(`${info.owner}:${info.mint}`)) return;
    api.add(info.mint, info.tokenAmount.amount);
  });

  return api.getBalances();
}

async function bscTvl(api) {
  const balance = await api.call({
    target: "0x77c9b49a58325131D08F9dC120388f20c57c2572",
    abi: 'erc20:balanceOf',
    params: ["0xEDBcdD0A45Fd8EBa749fFc10205c65CeA54336D5"],
  });

  api.add("0x77c9b49a58325131D08F9dC120388f20c57c2572", balance);
  return api.getBalances();
}

module.exports = {
  timetravel: false,
  methodology: "TVL is the collateral in RateX market vaults. The RateX lookup table defines which (vault authority, mint) pairs count, and those pairs' token accounts are read on-chain so accounts opened after the table was last extended are still included.",
  solana: { tvl: solanaTvl },
  bsc: { tvl: bscTvl }
};
