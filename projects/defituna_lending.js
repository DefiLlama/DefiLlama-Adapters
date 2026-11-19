const { getProvider, getAssociatedTokenAddress, sumTokens2 } = require("./helper/solana");
const { Program } = require("@coral-xyz/anchor");

async function getAccountsInBatches(connection, pubkeys, batchSize = 100) {
  const result = [];
  for (let i = 0; i < pubkeys.length; i += batchSize) {
    const batch = pubkeys.slice(i, i + batchSize);
    const infos = await connection.getMultipleAccountsInfo(batch);
    result.push(...infos);
  }
  return result;
}

// DefiTuna Lending is used to provide leveraged liquidity in DefiTuna Liquidity.
// TVL is calculated as the sum of the non-borrowed assets in the vaults.
// Borrowed amounts are derived from the values recorded in the vaults data.
async function tvl(api) {
  const provider = getProvider(api.chain);
  const program = new Program(tunaIDL, provider);
  const vaults = await program.account["vault"].all();

  // Available funds are held in token accounts whose ATA addresses are derived from the mint,
  // the vault’s public key, and the mint program’s public key
  const mints = vaults.map((vault) => vault.account.mint);
  const mintAccounts = await getAccountsInBatches(provider.connection, mints);
  // mintPrograms is an array of either TOKEN_PROGRAM_ID or TOKEN_2022_PROGRAM_ID
  const mintPrograms = mintAccounts.map((account) => account.owner);

  // Compute ATA addresses for all vaults
  const tokenAccounts = vaults.map((vault, i) =>
    getAssociatedTokenAddress(
      vault.account.mint,
      vault.publicKey,
      mintPrograms[i]
    )
  );

  return sumTokens2({ tokenAccounts, api });
}

// Borrowed amount is taken from the borrowedFunds values stored in the vaults account data.
async function borrowed(api) {
  const provider = getProvider(api.chain);
  const program = new Program(tunaIDL, provider);
  const vaults = await program.account["vault"].all();
  vaults.forEach((vault) =>
    api.add(vault.account.mint.toBase58(), vault.account.borrowedFunds)
  );
}

module.exports = {
  timetravel: false,
  solana: { tvl, borrowed },
  methodology: "TVL is calculated based on the amount of deposited tokens.",
  start: "2024-11-29",
};

const tunaIDL = {
  address: "tuna4uSQZncNeeiAMKbstuxA9CUkHH6HmC64wgmnogD",
  metadata: {
    name: "tuna",
    version: "3.1.3",
    spec: "0.1.0",
    description: "DefiTuna",
  },
  instructions: [],
  accounts: [
    { name: "Vault", discriminator: [211, 8, 232, 43, 2, 152, 117, 119] },
  ],
  errors: [],
  types: [
    {
      name: "Vault",
      type: {
        kind: "struct",
        fields: [
          { name: "version", docs: ["Struct version"], type: "u16" },
          {
            name: "bump",
            docs: ["Bump seed for the vault account"],
            type: { array: ["u8", 1] },
          },
          {
            name: "mint",
            docs: ["The mint of the token that this vault holds"],
            type: "pubkey",
          },
          {
            name: "deposited_funds",
            docs: [
              "The amount of funds deposited in the vault - takes into account accrued interest",
            ],
            type: "u64",
          },
          {
            name: "deposited_shares",
            docs: ["The amount of shares deposited in the vault"],
            type: "u64",
          },
          {
            name: "borrowed_funds",
            docs: [
              "The amount of funds borrowed from the vault - takes into account accrued interest",
            ],
            type: "u64",
          },
          {
            name: "borrowed_shares",
            docs: ["The amount of shares borrowed from the vault"],
            type: "u64",
          },
          {
            name: "unpaid_debt_shares",
            docs: [
              "Bad dept may appear on a position liquidation if not enough funds to repay the debt to a lending pool.",
            ],
            type: "u64",
          },
          {
            name: "interest_rate",
            docs: [
              "The interest rate of the vault per seconds. (1<<60) / 31536000 = 1152921504606846976 / 31536000 = 100% annually.",
            ],
            type: "u64",
          },
          {
            name: "last_update_timestamp",
            docs: ["The last time the vault was updated."],
            type: "u64",
          },
          {
            name: "supply_limit",
            docs: ["The maximum allowed supply for this vault."],
            type: "u64",
          },
          {
            name: "pyth_oracle_price_update",
            docs: ["Pyth oracle price update account."],
            type: "pubkey",
          },
          {
            name: "pyth_oracle_feed_id",
            docs: ["Pyth oracle price feed id."],
            type: "pubkey",
          },
          {
            name: "reserved",
            docs: ["Reserved"],
            type: { array: ["u8", 184] },
          },
        ],
      },
    },
  ],
};
