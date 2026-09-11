const { PublicKey } = require("@solana/web3.js");
const { getConnection, sumTokens2 } = require("../helper/solana");
const { bs58 } = require('@project-serum/anchor/dist/cjs/utils/bytes');

const PROGRAM_ID = new PublicKey("DRVSpZ2YUYYKgZP8XtLhAGtT1zYSCKzeHfb4DgRnrgqD");
const PROGRAM_VERSION = 1;
const TOKEN_STATE_TAG = 4;
const TOKEN_STATE_SIZE = 88;
const TOKEN_STATE_PROGRAM_ADDRESS_OFFSET = 40;
const PUBKEY_SIZE = 32;

function tokenStateDiscriminator() {
  const discriminator = Buffer.alloc(8);
  discriminator.writeUInt32LE(TOKEN_STATE_TAG, 0);
  discriminator.writeUInt32LE(PROGRAM_VERSION, 4);
  return bs58.encode(discriminator);
}

async function getTokenAccounts() {
  const tokenAccounts = new Set();
  
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

  return [...tokenAccounts];
}

async function tvl(api) {
  return sumTokens2({ api, tokenAccounts: await getTokenAccounts(), allowError: true});
}

module.exports = {
  timetravel: false,
  methodology:
    "Sum of SPL and Token-2022 assets held in Deriverse protocol custody vaults. Markets are discovered on-chain via the versioned InstrAccountHeader account discriminator under the Deriverse program DRVSpZ2YUYYKgZP8XtLhAGtT1zYSCKzeHfb4DgRnrgqD.",
  solana: {
    tvl,
  },
};