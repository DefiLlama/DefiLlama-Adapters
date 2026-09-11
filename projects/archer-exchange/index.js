const { PublicKey } = require("@solana/web3.js");
const sdk = require("@defillama/sdk");
const { getConnection, sumTokens2 } = require("../helper/solana");

const ARCHER_PROGRAM_ID = new PublicKey("Archer8kgiavM61GyusMzaaS2ft5sALtNsD1HxkUPMhy");

// ASCII "ACHRMKT1" — discriminator for MarketStateHeader accounts (see archer_v1 IDL)
const MARKET_DISCRIMINATOR = Buffer.from([65, 67, 72, 82, 77, 75, 84, 49]);

// MarketStateHeader layout offsets: https://github.com/SquareRoot-Labs/archer-market-maker/blob/e4ade13edc5bcb407618058aa3c03630f00cd32c/src/archer/types.rs#L81
const OFFSET_BASE_VAULT = 104;
const OFFSET_QUOTE_VAULT = 136;
const OFFSET_STATUS = 258;
const STATUS_CLOSED = 2;

async function tvl(api) {
  const connection = getConnection();

  const markets = await connection.getProgramAccounts(ARCHER_PROGRAM_ID, {
    filters: [
      { memcmp: { offset: 0, bytes: MARKET_DISCRIMINATOR.toString("base64"), encoding: "base64" } },
    ],
  });

  const vaults = [];
  for (const { account } of markets) {
    const data = account.data;
    if (data[OFFSET_STATUS] === STATUS_CLOSED) continue;
    const baseVault = new PublicKey(data.slice(OFFSET_BASE_VAULT, OFFSET_BASE_VAULT + 32)).toBase58();
    const quoteVault = new PublicKey(data.slice(OFFSET_QUOTE_VAULT, OFFSET_QUOTE_VAULT + 32)).toBase58();
    vaults.push(baseVault, quoteVault);
  }

  return sumTokens2({ api, tokenAccounts: vaults });
}

module.exports = {
  timetravel: false,
  methodology:
    "Sum of SPL token balances held in every Archer-Exchange market's base and quote vault token accounts. Markets are discovered on-chain via the MarketStateHeader account discriminator under program Archer8kgiavM61GyusMzaaS2ft5sALtNsD1HxkUPMhy; Closed markets are excluded.",
  solana: { tvl },
};
