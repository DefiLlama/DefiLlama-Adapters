const { getProvider, sumTokens2, getAssociatedTokenAddress } = require("../helper/solana");
const { PublicKey } = require("@solana/web3.js");
const { bs58 } = require("@project-serum/anchor/dist/cjs/utils/bytes");

const PROGRAM_ID = new PublicKey("offerbkFMvVfpQhL8ZQ5iromnjct5rz3r52B9ewu3ie");
const LOAN_DISC = Buffer.from([20, 195, 70, 117, 165, 227, 182, 1]);
const OFFER_DISC = Buffer.from([215, 88, 60, 71, 170, 162, 73, 229]);
const TOKEN_ASSET = 1;                 // Asset enum: 0=None, 1=Token, 2/3/4=NFT variants
const LOAN_ACTIVE = 0;                 // LoanStatus: 0=Active, 1=Repaid, 2=Defaulted
const OFFER_OPEN = new Set([0, 1]);    // OfferStatus: 0=Active, 1=PartiallyFilled, 2=Fulfilled, 3=Cancelled
const SIDE_PRINCIPAL = 0, SIDE_COLLATERAL = 1; // OfferSide

// Loan field offsets
const LOAN_STATUS = 136;
const LOAN_PRINCIPAL_ASSET = 152;
const LOAN_PRINCIPAL_AMOUNT = 704;

// Offer field offsets
const OFFER_CREATOR = 8;
const OFFER_SIDE = 40;
const OFFER_STATUS = 41;
const OFFER_PRINCIPAL_ASSET = 48;   
const OFFER_COLLATERAL_ASSET = 320;

const readPk = (d, o) => new PublicKey(d.slice(o, o + 32));
const userPda = owner => PublicKey.findProgramAddressSync([Buffer.from("user"), owner.toBuffer()], PROGRAM_ID)[0];
const loanVault = loan => PublicKey.findProgramAddressSync([Buffer.from("loan_vault"), loan.toBuffer()], PROGRAM_ID)[0];

async function getAccounts(discriminator) {
  const connection = getProvider().connection;
  return connection.getProgramAccounts(PROGRAM_ID, {
    dataSlice: { offset: 0, length: 912 }, // covers every field we read
    filters: [{ memcmp: { offset: 0, bytes: bs58.encode(discriminator) } }],
  });
}

async function tvl(api) {
  const tokenAccounts = [];

  // active-loan collateral -> per-loan vault PDA
  const loans = await getAccounts(LOAN_DISC);
  for (const { pubkey, account: { data } } of loans) {
    if (data[LOAN_STATUS] === LOAN_ACTIVE) tokenAccounts.push(loanVault(pubkey).toBase58());
  }

  // open-offer funds -> the creator's per-mint escrow ATA (owned by their User PDA).
  // Principal-side (lender) escrows principal; Collateral-side (borrower) escrows collateral.
  const offers = await getAccounts(OFFER_DISC);
  for (const { account: { data } } of offers) {
    if (!OFFER_OPEN.has(data[OFFER_STATUS])) continue;
    const side = data[OFFER_SIDE];
    const assetOffset = side === SIDE_PRINCIPAL ? OFFER_PRINCIPAL_ASSET
      : side === SIDE_COLLATERAL ? OFFER_COLLATERAL_ASSET : -1;
    if (assetOffset < 0 || data[assetOffset] !== TOKEN_ASSET) continue;
    const mint = readPk(data, assetOffset + 1);
    const tokenProgram = readPk(data, assetOffset + 33);
    const owner = userPda(readPk(data, OFFER_CREATOR));
    tokenAccounts.push(getAssociatedTokenAddress(mint, owner, tokenProgram));
  }

  // dedupe (a user's offers in the same mint share one escrow account) and tolerate
  // derived accounts that don't exist on-chain (closed vaults / never-funded escrows)
  return sumTokens2({ api, tokenAccounts: [...new Set(tokenAccounts)], allowError: true });
}

async function borrowed(api) {
  const loans = await getAccounts(LOAN_DISC);
  for (const { account: { data } } of loans) {
    if (data[LOAN_STATUS] !== LOAN_ACTIVE) continue;
    if (data[LOAN_PRINCIPAL_ASSET] !== TOKEN_ASSET) continue;
    api.add(readPk(data, LOAN_PRINCIPAL_ASSET + 1).toBase58(), data.readBigUInt64LE(LOAN_PRINCIPAL_AMOUNT).toString());
  }
}

module.exports = {
  timetravel: false,
  solana: { tvl, borrowed },
};