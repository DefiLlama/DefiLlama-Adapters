const { getProvider, sumTokens2 } = require("../helper/solana");
const { PublicKey } = require("@solana/web3.js");
const anchor = require("@project-serum/anchor");
const bs58 = require('bs58');

const solProgramId = "CRSeeBqjDnm3UPefJ9gxrtngTsnQRhEJiTA345Q83X3v";
const usdcProgramId = "1avaAUcjccXCjSZzwUvB2gS3DzkkieV2Mw8CjdN65uu";
const stakingProgramId = "85vAnW1P89t9tdNddRGk6fo5bDxhYAY854NfVJDqzf7h";
const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
const SPL_ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");

const edgeCaseTimestamps = [
  { start: 1713880000, end: 1713885480 }, // 10:32 AM - 10:58 AM ET on April 23, 2024
  { start: 1713874500, end: 1713876060 }, // 8:15 AM - 8:41 AM ET on April 23, 2024
];

const idleAccount = new PublicKey("bkhAyULeiXwju7Zmy4t3paDHtVZjNaofVQ4VgEdTWiE");
const deployedAccount = new PublicKey("6riP1W6R3qzUPWYwLGtXEC23aTqmyAEdDtXzhntJquAh");
const multisigAccount = new PublicKey("DkPYEECBc28iute8vWvAuAU4xiM91Sht59p7FHZbmNQv");
const pendingUnstakeAccount = new PublicKey("HTnwdgfXrA6gZRiQsnfxLKbvdcqnxdbuC2FJsmCCVMw9");
const usdcAddress = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
const iscAddress = new PublicKey("J9BcrQfX4p9D1bvLzRNCbMDv8f44a9LFdeqNE4Yk2WMD");
const usdcPoolAccount = new PublicKey("9m3wEeK3v5yyqDGMnDiDRR3FjCwZjRVB4n92pieGtTbP");
const iscPoolAccount = new PublicKey("CrsxVEF7YNGAk9QwwbB2vuesUWoDopfgFAhA9apoCJ2z");

function getPositionFilters() {
  const sizeFilter = { dataSize: 178 };
  const value = BigInt(9999);
  const valueBuffer = Buffer.alloc(8);
  valueBuffer.writeBigUInt64LE(value, 0);
  const val0Filter = {
    memcmp: {
      offset: 40,
      bytes: bs58.encode(Buffer.from(new Uint8Array(8))),
    },
  }
  const val9999Filter = {
    memcmp: {
      offset: 40,
      bytes: bs58.encode(valueBuffer),
    },
  }
  return [
    [sizeFilter, val0Filter],
    [sizeFilter, val9999Filter],
  ]
}

async function tvl(api) {
  const provider = getProvider();
  for (const programId of [solProgramId, usdcProgramId]) {

    const program = new anchor.Program(lavarageIDL, programId, provider);
    const pools = await program.account.pool.all()
    const poolMap = {}
    pools.forEach((pool) => {
      poolMap[pool.publicKey.toBase58()] = pool.account.collateralType.toBase58()
    })
    for (const filter of getPositionFilters()) {
      const positions = await program.account.position.all(filter)
      positions.forEach(({ account }) => {
        let { closeStatusRecallTimestamp, pool, collateralAmount, timestamp } = account
        const token = poolMap[pool.toBase58()]
        const closeTS = closeStatusRecallTimestamp.toNumber()
        const ts = timestamp.toNumber()
        if ((closeTS && !isWithinEdgeCaseTimeRange(ts)) || !token) return;
        api.add(token, collateralAmount.toString())
      })
    }
  }
  return sumTokens2({
    balances: api.getBalances(), tokenAccounts: [
      getAssociatedTokenAddress(usdcAddress, usdcPoolAccount),
      getAssociatedTokenAddress(iscAddress, iscPoolAccount),
    ], solOwners: [
      deployedAccount, pendingUnstakeAccount,
    ]
  })
}

function getAssociatedTokenAddress(mint, owner,) {
  const [associatedTokenAddress] = PublicKey.findProgramAddressSync([owner.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()], SPL_ASSOCIATED_TOKEN_PROGRAM_ID);
  return associatedTokenAddress;
}

function isWithinEdgeCaseTimeRange(closeTimestamp) {
  return edgeCaseTimestamps.some(
    ({ start, end }) => closeTimestamp >= start && closeTimestamp <= end
  );
}

module.exports = {
  timetravel: false,
  solana: {
    tvl,
  },
};

const lavarageIDL = {
  version: "0.1.0",
  name: "lavarage",
  instructions: [],
  accounts: [
    {
      name: "pool",
      type: {
        kind: "struct",
        fields: [
          {
            name: "interestRate",
            type: "u8",
          },
          {
            name: "collateralType",
            type: "publicKey",
          },
          {
            name: "maxBorrow",
            type: "u64",
          },
          {
            name: "nodeWallet",
            type: "publicKey",
          },
          {
            name: "maxExposure",
            type: "u64",
          },
          {
            name: "currentExposure",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "position",
      type: {
        kind: "struct",
        fields: [
          {
            name: "pool",
            type: "publicKey",
          },
          {
            name: "closeStatusRecallTimestamp",
            type: "u64",
          },
          {
            name: "amount",
            type: "u64",
          },
          {
            name: "userPaid",
            type: "u64",
          },
          {
            name: "collateralAmount",
            type: "u64",
          },
          {
            name: "timestamp",
            type: "i64",
          },
          {
            name: "trader",
            type: "publicKey",
          },
          {
            name: "seed",
            type: "publicKey",
          },
          {
            name: "closeTimestamp",
            type: "i64",
          },
          {
            name: "closingPositionSize",
            type: "u64",
          },
          {
            name: "interestRate",
            type: "u8",
          },
          {
            name: "lastInterestCollect",
            type: "i64",
          },
        ],
      },
    },
  ],
  types: [],
  events: [],
  errors: [],
};
