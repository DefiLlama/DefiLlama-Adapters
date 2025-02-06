import { Program } from "@project-serum/anchor";
import {
  PublicKey,
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/web3.js";
import { getConnection, decodeAccount } from "../helper/solana";
import idl from "./idl/krystal_auto_vault.js";

const CLMM_PROGRAM_ID = new PublicKey(
  "CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK"
);
const POSITION_SEED = Buffer.from("position", "utf8");

async function tvl(api) {
  const connection = getConnection();
  const program = new Program(idl, { connection });

  // Load all the vaults in the program
  const vaults = await program.account.userVault.all();

  try {
    const positions = [];
    for (const account of vaults) {
      const vault = account.publicKey;
      const positionsByOwner = await findClmmPositionsByOwner(
        connection,
        vault
      );
      positions.push(...positionsByOwner);
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
