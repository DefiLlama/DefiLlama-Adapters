const sdk = require("@defillama/sdk");
const { PublicKey } = require("@solana/web3.js");
const { getConnection, sumTokens2 } = require("../helper/solana");

const bs58Module = require("bs58");
const bs58 = bs58Module.default || bs58Module;

const PROGRAM_ID = new PublicKey("DRVSpZ2YUYYKgZP8XtLhAGtT1zYSCKzeHfb4DgRnrgqD");
const PROGRAM_VERSION = 1;
const TOKEN_STATE_TAG = 4;
const TOKEN_STATE_SIZE = 88;
const TOKEN_STATE_PROGRAM_ADDRESS_OFFSET = 40;
const PUBKEY_SIZE = 32;

const KNOWN_TOKEN_ACCOUNTS = [
  "7393aZwSZwJzCb1BJe5d8YaTHzRJqCJC7H4qH7dfMeAm", // DRVS
  "EPUHjseXG3izk3MVUJ1PcyWT9xeBhtAnq8gUpq3j8Uni", // USDC
  "CJ1fhvsz9FwFM54JyXpNvAj6dvxtiRQjMhYmG1aQVVX8", // wSOL
  "UUUXQdoC85FmgUgDMfYj3UsBWMLSjU7gVj4QmYGdMRx", // USDT
  "CaJc4c4jrthcEhwxXZgqCpAixmaPtwe6HusN5PSCRTGQ", // cbBTC
];

function tokenStateDiscriminator() {
  const discriminator = Buffer.alloc(8);
  discriminator.writeUInt32LE(TOKEN_STATE_TAG, 0);
  discriminator.writeUInt32LE(PROGRAM_VERSION, 4);
  return bs58.encode(discriminator);
}

async function getTokenAccounts() {
  const tokenAccounts = new Set(KNOWN_TOKEN_ACCOUNTS);

  try {
    const accounts = await getConnection().getProgramAccounts(PROGRAM_ID, {
      filters: [
        { dataSize: TOKEN_STATE_SIZE },
        { memcmp: { offset: 0, bytes: tokenStateDiscriminator() } },
      ],
    });

    accounts.forEach(({ account }) => {
      const programAddress = account.data.subarray(
        TOKEN_STATE_PROGRAM_ADDRESS_OFFSET,
        TOKEN_STATE_PROGRAM_ADDRESS_OFFSET + PUBKEY_SIZE,
      );
      tokenAccounts.add(new PublicKey(programAddress).toString());
    });
  } catch (error) {
    sdk.log("Deriverse dynamic token account discovery failed, using known accounts only", error.message);
  }

  return [...tokenAccounts];
}

async function tvl(api) {
  return sumTokens2({
    api,
    tokenAccounts: await getTokenAccounts(),
    allowError: true,
  });
}

module.exports = {
  timetravel: false,
  methodology:
    "Sum of SPL and Token-2022 assets held in Deriverse protocol custody vaults. Markets are discovered on-chain via the versioned InstrAccountHeader account discriminator under the Deriverse program DRVSpZ2YUYYKgZP8XtLhAGtT1zYSCKzeHfb4DgRnrgqD.",
  solana: {
    tvl,
  },
};
