const { Program } = require("@coral-xyz/anchor");
const { PublicKey } = require("@solana/web3.js");
const {
  getConnection,
  decodeAccount,
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
} = require("../helper/solana");
const idl = require("./idl/krystal_auto_vault.json");
const { addUniV3LikePosition } = require("../helper/unwrapLPs.js");
const { getUniqueAddresses } = require("../helper/tokenMapping.js");
const { get } = require("../helper/http.js");

const CLMM_PROGRAM_ID = new PublicKey(
  "CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK"
);
const POSITION_SEED = Buffer.from("position", "utf8");

async function tvl(api) {
  const connection = getConnection();

  const program = new Program(idl, { connection });
  const pools = new Map();
  const pdaPersonalPositionAddressesAll = []

  // Load all the vaults in the program
  const vaults = await program.account.userVault.all();

  const positions = [];
  for (const account of vaults) {
    const vault = account.publicKey;
    await findClmmPositionsByOwner(connection, vault);
  }

  const positionAccountInfos = await connection.getMultipleAccountsInfo(pdaPersonalPositionAddressesAll);

  positionAccountInfos.map((account) => {
    if (!account) return;

    positions.push(decodeAccount("raydiumPositionInfo", account));
  });

  const poolIds = getUniqueAddresses(positions.map((position) => position.poolId.toBase58()), "solana");
  const poolAccounts = await connection.getMultipleAccountsInfo(poolIds.map(i => new PublicKey(i)));

  for (let i = 0; i < poolIds.length; i++) {
    const poolId = poolIds[i];
    const poolAccount = poolAccounts[i];
    const poolInfo = decodeAccount("raydiumCLMM", poolAccount);
    pools.set(poolId, poolInfo);
  }

  for (const position of positions) {
    const poolId = position.poolId;
    const poolKey = poolId.toBase58();

    let poolInfo = pools.get(poolKey);

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
    const [tokenAccounts, token2022Accounts] = await Promise.all([
      connection.getParsedTokenAccountsByOwner(owner, {
        programId: TOKEN_PROGRAM_ID,
      }),
      connection.getParsedTokenAccountsByOwner(owner, {
        programId: TOKEN_2022_PROGRAM_ID,
      }),
    ]);

    const allTokenAccounts = [];
    if (tokenAccounts?.value) {
      allTokenAccounts.push(...tokenAccounts.value);
    }
    if (token2022Accounts?.value) {
      allTokenAccounts.push(...token2022Accounts.value);
    }

    const tokenNftMints = [];
    allTokenAccounts.forEach((tokenAccount) => {
      const info = tokenAccount.account.data.parsed.info;
      if (info.tokenAmount.amount == "1" && info.tokenAmount.decimals == 0) {
        tokenNftMints.push(new PublicKey(info.mint));
      } else {
        api.add(info.mint, info.tokenAmount.amount)
      }
    });

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

async function tvlApi(api) {
  const res = await get('https://api.krystal.app/solana/v1/lp/tvl')
  api.addUSDValue(+res.tvl)
}

module.exports = { tvl: tvlApi };