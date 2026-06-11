const { PublicKey } = require("@solana/web3.js");
const bs58 = require("bs58");
const { getConnection } = require("../helper/solana");

const OVERPASS_PROGRAM_ID = new PublicKey("WRAPdXmxrH37RKUbH1QMnYrKdNe8w4Kz44t1cXmYeum");
const WRAPPER_VAULT_SIZE = 558;
const WRAPPER_VAULT_DISCRIMINATOR = Buffer.from([103, 101, 152, 26, 112, 217, 184, 219]);
const WRAPPER_VAULT_DISC_BASE58 = (bs58.default ?? bs58).encode(WRAPPER_VAULT_DISCRIMINATOR);

const UNDERLYING_MINT_OFFSET = 84;
const WRAPPER_SUPPLY_OFFSET = 222;

function readPublicKey(data, offset) {
  return new PublicKey(data.subarray(offset, offset + 32)).toBase58();
}

async function tvl(api) {
  const connection = getConnection(api.chain);
  const wrappers = await connection.getProgramAccounts(OVERPASS_PROGRAM_ID, {
    filters: [
      { dataSize: WRAPPER_VAULT_SIZE },
      { memcmp: { offset: 0, bytes: WRAPPER_VAULT_DISC_BASE58 } },
    ],
  });

  let activeWrappers = 0;
  for (const { account } of wrappers) {
    const data = account.data;
    const wrapperSupply = data.readBigUInt64LE(WRAPPER_SUPPLY_OFFSET);
    if (wrapperSupply === 0n) continue;

    const underlyingMint = readPublicKey(data, UNDERLYING_MINT_OFFSET);
    api.add(underlyingMint, wrapperSupply.toString());
    activeWrappers += 1;
  }

  api.log(`Counted ${activeWrappers} active Overpass wrapper mints`);
}

module.exports = {
  timetravel: false,
  methodology:
    "TVL counts the outstanding supply of active Overpass yield-token wrappers on Solana, denominated in each wrapper's underlying token. WrapperVault accounts are discovered directly from the Overpass program and zero-supply wrappers are excluded.",
  solana: {
    tvl,
  },
};
