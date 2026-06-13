const { getProvider, sumTokens2 } = require("./helper/solana");
const { PublicKey } = require("@solana/web3.js");
const bs58 = require("bs58").default || require("bs58");

const PERP_PROGRAM = new PublicKey("PERPHjGBqRHArX4DySjwM6UJHiR3sWAatqfdBS2qQJu");
const CUSTODY_DISCRIMINATOR = Buffer.from([1, 184, 48, 81, 93, 131, 63, 145]);
const OFFSET_MINT          = 8 + 32;
const OFFSET_TOKEN_ACCOUNT = 8 + 64;
const OFFSET_DEBT          = 8 + 996;
const OFFSET_STAKED        = 8 + 1052;
const DEBT_PRECISION = 10n ** 9n;

async function getCustodies() {
  const conn = getProvider().connection;
  const accounts = await conn.getProgramAccounts(PERP_PROGRAM, {
    filters: [{ memcmp: { offset: 0, bytes: bs58.encode(CUSTODY_DISCRIMINATOR) } }],
  });
  return accounts.map(({ account }) => {
    const data = account.data;
    const mint = new PublicKey(data.slice(OFFSET_MINT, OFFSET_MINT + 32)).toBase58();
    const tokenAccount = new PublicKey(data.slice(OFFSET_TOKEN_ACCOUNT, OFFSET_TOKEN_ACCOUNT + 32)).toBase58();
    const staked = data.readBigUInt64LE(OFFSET_STAKED);
    const debtLo = data.readBigUInt64LE(OFFSET_DEBT);
    const debtHi = data.readBigUInt64LE(OFFSET_DEBT + 8);
    const debt = (debtLo + (debtHi << 64n)) / DEBT_PRECISION;
    return { mint, tokenAccount, staked, debt };
  });
}

async function tvl(api) {
  const custodies = await getCustodies();
  await sumTokens2({ api, tokenAccounts: custodies.map(c => c.tokenAccount) });
  for (const c of custodies) if (c.staked > 0n) api.add(c.mint, c.staked.toString());
}

async function borrowed(api) {
  const custodies = await getCustodies();
  for (const c of custodies) if (c.debt > 0n) api.add(c.mint, c.debt.toString());
}

module.exports = {
  hallmarks: [
    ['2024-01-29',"launch jup exchange"]
  ],
  timetravel: false,
  methodology:
    "TVL sums each Custody's tokenAccount SPL balance (LP liquidity plus trader collateral held in the same custody token account) plus Custody.totalStakedAmountLamports (the SOL custody's natively-staked portion held in Solana stake accounts). Borrowed is Custody.debt/1e9 per asset — USDC lent out to JLP-loan borrowers, fully collateralized by JLP, reported separately.",
  solana: {
    tvl,
    borrowed,
  },
};
