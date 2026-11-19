const ADDRESSES = require('../helper/coreAssets.json')
// Seeryx TVL adapter for DefiLlama (projects/seeryx/index.js).
//
// Seeryx is a prediction market on Solana: Up/Down crypto rounds and event markets resolved by UMA. Users' USDC
// never sit in a shared pool: every user has a proxy (the associated token account of their UserAccount PDA), every
// market keeps its collateral in an escrow (the ATA of the Market PDA). Kept fees (the ATA of the Fees PDA) are
// protocol revenue and are not counted. TVL = the USDC held by the user and market accounts. Both account kinds are enumerated from the program by their
// Anchor discriminators, so a new user or market is counted without any change here.
const { PublicKey } = require("@solana/web3.js");
const { getConnection, sumTokens2, getAssociatedTokenAddress } = require("../helper/solana");

const PROGRAM_ID = "2uUbvYHqBH1HDVzABGPcqrjHodoBVcNkq6Nrv6MABaiv";
const USDC = ADDRESSES.solana.USDC;

// Anchor account discriminators, sha256("account:<Name>")[0..8]
const DISCRIMINATORS = [
  Buffer.from([211, 33, 136, 16, 186, 110, 242, 127]), // UserAccount
  Buffer.from([219, 190, 213, 55, 0, 227, 198, 154]), // Market
];

// One getProgramAccounts call (the public RPC rate-limits that method hard), reading only the first 8 bytes of
// every account of the program, then keeping the user and market accounts.
async function owners() {
  const connection = getConnection();
  const accounts = await connection.getProgramAccounts(new PublicKey(PROGRAM_ID), { dataSlice: { offset: 0, length: 8 } });
  return accounts
    .filter((a) => DISCRIMINATORS.some((d) => d.equals(a.account.data.subarray(0, 8))))
    .map((a) => a.pubkey.toBase58());
}

// Every one of those accounts keeps its USDC in its associated token account, so the token accounts are derived here
// and read in one batch (no getTokenAccountsByOwner per owner).
async function tvl(api) {
  const tokenAccounts = (await owners()).map((o) => String(getAssociatedTokenAddress(USDC, o)));
  return sumTokens2({ api, tokenAccounts, allowError: true });
}

module.exports = {
  timetravel: false,
  methodology:
    "USDC held by the Seeryx program's accounts on Solana: every user's proxy (the token account of their UserAccount PDA), and every market's collateral escrow (the token account of the Market PDA). Protocol fees held by the Fees account are excluded. The accounts are enumerated from the program by their Anchor discriminators and their USDC balances summed; nothing is read from Seeryx's own API.",
  solana: { tvl },
};
