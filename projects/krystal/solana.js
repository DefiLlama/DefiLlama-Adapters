const { Program } = require("@coral-xyz/anchor");
const { PublicKey } = require("@solana/web3.js");
const {
  TOKEN_PROGRAM_ID,
} = require("@project-serum/anchor/dist/cjs/utils/token");
const {
  getConnection,
  decodeAccount,
  getProvider,
} = require("../helper/solana");
const idl = require("./idl/krystal_auto_vault.json");
const { addUniV3LikePosition } = require("../helper/unwrapLPs.js");

const TOKEN_2022_PROGRAM_ID = new PublicKey(
  "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
);
const CLMM_PROGRAM_ID = new PublicKey(
  "CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK"
);
const KRYSTAL_VAULT = new PublicKey(
  "6tgjvHkFUUUbbacEWg225H6AazxoSTso8ix9vkXFScTU"
);
const POSITION_SEED = Buffer.from("position", "utf8");

async function tvl(api) {
  const connection = getConnection();
  const provider = getProvider();

  const program = new Program(idl, KRYSTAL_VAULT, provider);
  const pools = new Map();

  try {
    // Load all the vaults in the program
    const vaults = await program.account.userVault.all();

    const positions = [];
    for (const account of vaults) {
      const vault = account.publicKey;
      const positionsByOwner = await findClmmPositionsByOwner(
        connection,
        vault
      );
      positions.push(...positionsByOwner);
    }

    for (const position of positions) {
      const poolId = position.poolId;
      const poolKey = poolId.toBase58();

      let poolInfo = pools.get(poolKey);
      if (!poolInfo) {
        const pool = await connection.getAccountInfo(poolId);
        if (!pool) continue;

        const info = decodeAccount("raydiumCLMM", pool);
        pools.set(poolKey, info);
        poolInfo = info;
      }

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
  } catch (error) {
    console.error(error);
  }
}

async function findClmmPositionsByOwner(connection, owner) {
  const [tokenAccounts, token2022Accounts] = await Promise.all([
    connection.getParsedTokenAccountsByOwner(owner, {
      programId: TOKEN_PROGRAM_ID,
    }),
    connection.getParsedTokenAccountsByOwner(owner, {
      programId: TOKEN_2022_PROGRAM_ID,
    }),
  ]);

  const allTokenAccounts = [
    ...tokenAccounts?.value,
    ...token2022Accounts?.value,
  ];
  const tokenNftMints = [];
  allTokenAccounts.forEach((tokenAccount) => {
    const info = tokenAccount.account.data.parsed.info;
    if (info.tokenAmount.amount == "1" && info.tokenAmount.decimals == 0) {
      tokenNftMints.push(new PublicKey(info.mint));
    }
  });

  const pdaPersonalPositionAddresses = tokenNftMints.map((nftMint) => {
    return getPdaPersonalPositionAddress(nftMint);
  });

  const accountInfos = await connection.getMultipleAccountsInfo(
    pdaPersonalPositionAddresses
  );

  const positionAccounts = [];
  accountInfos.map((account) => {
    if (!account) return;

    positionAccounts.push(decodeAccount("raydiumPositionInfo", account));
  });

  return positionAccounts;
}

function getPdaPersonalPositionAddress(nftMint) {
  const [pda] = PublicKey.findProgramAddressSync(
    [POSITION_SEED, nftMint.toBuffer()],
    CLMM_PROGRAM_ID
  );

  return pda;
}

module.exports = {
  tvl,
};
