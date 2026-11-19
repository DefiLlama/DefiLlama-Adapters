const { PublicKey } = require("@solana/web3.js");
const sdk = require("@defillama/sdk");
const { bs58 } = require("@project-serum/anchor/dist/cjs/utils/bytes");
const {
  getConnection,
  decodeAccount,
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
} = require("../helper/solana");
const idl = require("./idl/krystal_auto_vault.json");
const { addUniV3LikePosition } = require("../helper/unwrapLPs.js");
const { getUniqueAddresses } = require("../helper/tokenMapping.js");
const { getCache, setCache } = require("../helper/cache");

const CACHE_PROJECT = "krystal";

const CLMM_PROGRAM_ID = new PublicKey(
  "CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK"
);
const POSITION_SEED = Buffer.from("position", "utf8");
const USER_VAULT_ACCOUNT_SIZE = 41;
const userVaultAccount = idl.accounts.find(({ name }) => name === "UserVault");

if (!userVaultAccount) {
  throw new Error(`Missing UserVault account in Krystal IDL. Accounts: ${idl.accounts.map(({ name }) => name).join(", ")}`);
}

const USER_VAULT_DISCRIMINATOR = userVaultAccount.discriminator;

// Each vault costs two getTokenAccountsByOwner calls, and about two thirds of the vaults hold
// nothing (no token accounts, or only zero balances). Those are remembered in the cache and
// rescanned once a week instead of on every run; a refilled vault is picked up at its next rescan.
const DORMANT_RECHECK_SECONDS = 7 * 24 * 3600;

async function tvl(api) {
  const connection = getConnection();
  const vaults = await connection.getProgramAccounts(new PublicKey(idl.address), {
    filters: [
      { dataSize: USER_VAULT_ACCOUNT_SIZE },
      { memcmp: { offset: 0, bytes: bs58.encode(Buffer.from(USER_VAULT_DISCRIMINATOR)) } },
    ],
  });

  const now = Math.floor(Date.now() / 1e3);
  const { dormant = {} } = await getCache(CACHE_PROJECT, "solana"); // vault -> last time it was found empty
  const owners = vaults
    .map((i) => i.pubkey)
    .filter((vault) => now - (dormant[vault.toBase58()] ?? 0) >= DORMANT_RECHECK_SECONDS);

  const emptyOwners = new Set();
  await addRaydiumPositions({ api, connection, owners, emptyOwners });

  const scanned = new Set(owners.map((vault) => vault.toBase58()));
  const updatedDormant = {};
  vaults.forEach(({ pubkey }) => {
    const vault = pubkey.toBase58();
    if (emptyOwners.has(vault)) updatedDormant[vault] = now;
    else if (!scanned.has(vault)) updatedDormant[vault] = dormant[vault];
  });
  await setCache(CACHE_PROJECT, "solana", { dormant: updatedDormant });
}

async function addRaydiumPositions({ api, owners = [], owner, connection = getConnection(), emptyOwners }) {

  const pools = new Map();

  const pdaPersonalPositionAddressesAll = []
  if (owner) owners.push(owner)


  const positions = [];
  await sdk.util.runInPromisePool({
    concurrency: 5,
    items: owners,
    processor: async (vault) => {
      if (typeof vault === "string") vault = new PublicKey(vault);
      await findClmmPositionsByOwner(connection, vault);
    },
  });

  const positionAccountInfos = await connection.getMultipleAccountsInfo(pdaPersonalPositionAddressesAll);

  positionAccountInfos.forEach((account) => {
    if (!account || account.owner.toBase58() != CLMM_PROGRAM_ID) return;
    positions.push(decodeAccount("raydiumPositionInfo", account));
  });

  const poolIds = getUniqueAddresses(positions.map((position) => position.poolId.toBase58()), "solana");
  const poolAccounts = await connection.getMultipleAccountsInfo(poolIds.map(i => new PublicKey(i)));

  for (let i = 0; i < poolIds.length; i++) {
    const poolId = poolIds[i];
    const poolAccount = poolAccounts[i];
    if (!poolAccount) continue;
    pools.set(poolId, decodeAccount("raydiumCLMM", poolAccount));
  }

  for (const position of positions) {
    const poolId = position.poolId;
    const poolKey = poolId.toBase58();

    const poolInfo = pools.get(poolKey);
    if (!poolInfo) continue;

    addUniV3LikePosition({
      api,
      token0: poolInfo.mintA.toBase58(),
      token1: poolInfo.mintB.toBase58(),
      liquidity: position.liquidity.toNumber(),
      tickLower: position.tickLower,
      tickUpper: position.tickUpper,
      tick: poolInfo.tickCurrent,
    });
  }


  async function findClmmPositionsByOwner(connection, owner) {
    const tokenAccounts = await connection.getTokenAccountsByOwner(owner, { programId: TOKEN_PROGRAM_ID });
    const token2022Accounts = await connection.getTokenAccountsByOwner(owner, { programId: TOKEN_2022_PROGRAM_ID });

    const allTokenAccounts = [];
    if (tokenAccounts?.value) {
      allTokenAccounts.push(...tokenAccounts.value);
    }
    if (token2022Accounts?.value) {
      allTokenAccounts.push(...token2022Accounts.value);
    }

    const tokenNftMints = [];
    let holdsValue = false;
    allTokenAccounts.forEach(({ account }) => {
      const { amount, mint } = decodeAccount("tokenAccount", account)

      const rawAmount = amount.toString();
      const token = mint.toBase58();
      if (rawAmount !== "0") holdsValue = true;
      if (rawAmount === "1") {
        tokenNftMints.push(mint);
      } else {
        api.add(token, rawAmount)
      }
    });

    if (!holdsValue && emptyOwners) emptyOwners.add(owner.toBase58());

    const pdaPersonalPositionAddresses = tokenNftMints.map(getPdaPersonalPositionAddress)
    pdaPersonalPositionAddressesAll.push(...pdaPersonalPositionAddresses)
  }

}

function getPdaPersonalPositionAddress(nftMint) {
  const [pda] = PublicKey.findProgramAddressSync(
    [POSITION_SEED, nftMint.toBuffer()],
    CLMM_PROGRAM_ID
  );

  return pda;
}

module.exports = { tvl, addRaydiumPositions, };
