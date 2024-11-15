const axios = require("axios");
const { getConnection, getProvider } = require("../helper/solana");
const { PublicKey } = require("@solana/web3.js");
const anchor = require("@project-serum/anchor");
const splToken = require("@solana/spl-token");

const { bs58 } = require("@project-serum/anchor/dist/cjs/utils/bytes");

const solProgramId = "CRSeeBqjDnm3UPefJ9gxrtngTsnQRhEJiTA345Q83X3v";
const usdcProgramId = "1avaAUcjccXCjSZzwUvB2gS3DzkkieV2Mw8CjdN65uu";
const stakingProgramId = "85vAnW1P89t9tdNddRGk6fo5bDxhYAY854NfVJDqzf7h";
const TOKEN_PROGRAM_ID = new PublicKey(
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
);
const SPL_ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey(
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
);

const edgeCaseTimestamps = [
  { start: 1713880000, end: 1713885480 }, // 10:32 AM - 10:58 AM ET on April 23, 2024
  { start: 1713874500, end: 1713876060 }, // 8:15 AM - 8:41 AM ET on April 23, 2024
];

const idleAccount = new PublicKey(
  "bkhAyULeiXwju7Zmy4t3paDHtVZjNaofVQ4VgEdTWiE"
);
const deployedAccount = new PublicKey(
  "6riP1W6R3qzUPWYwLGtXEC23aTqmyAEdDtXzhntJquAh"
);
const multisigAccount = new PublicKey(
  "DkPYEECBc28iute8vWvAuAU4xiM91Sht59p7FHZbmNQv"
);
const pendingUnstakeAccount = new PublicKey(
  "HTnwdgfXrA6gZRiQsnfxLKbvdcqnxdbuC2FJsmCCVMw9"
);
const usdcAddress = new PublicKey(
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
);
const iscAddress = new PublicKey(
  "J9BcrQfX4p9D1bvLzRNCbMDv8f44a9LFdeqNE4Yk2WMD"
);
const usdcPoolAccount = new PublicKey(
  "9m3wEeK3v5yyqDGMnDiDRR3FjCwZjRVB4n92pieGtTbP"
);
const iscPoolAccount = new PublicKey(
  "CrsxVEF7YNGAk9QwwbB2vuesUWoDopfgFAhA9apoCJ2z"
);

async function tvl(api) {
  const provider = getProvider();
  const connection = getConnection();

  try {
    const solProgram = new anchor.Program(lavarageIDL, solProgramId, provider);
    const usdcProgram = new anchor.Program(
      lavarageIDL,
      usdcProgramId,
      provider
    );
    const stakingProgram = new anchor.Program(
      stakingIDL,
      stakingProgramId,
      provider
    );

    const { prices, collateralMap, decimalPlacesMap } = await fetchCollateralPricesFromPools();

    // Calculate sum of opened positions based on collateral amount * price
    const sumOpenedPositions = await getSumOpenedPositions(
      solProgram,
      usdcProgram,
      prices,
      collateralMap,
      decimalPlacesMap
    );
    const stakingAccounts = await getStakingAccounts(stakingProgram);

    const sumStaked = (
      await Promise.all(
        stakingAccounts.map((sa) =>
          solProgram.provider.connection.getBalance(sa.pubkey)
        )
      )
    ).reduce((acc, cur) => acc + cur, 0);

    const sumIdle = await connection.getBalance(idleAccount);
    const sumDeployed = (await connection.getAccountInfo(deployedAccount))
      .lamports;
    const sumMultisig = (await connection.getAccountInfo(multisigAccount))
      .lamports;
    const sumPendingUnstake = await connection.getBalance(
      pendingUnstakeAccount
    );

    const usdcTokenAccount = await getAssociatedTokenAddress(
      usdcAddress,
      usdcPoolAccount,
      true
    );
    const iscTokenAccount = await getAssociatedTokenAddress(
      iscAddress,
      iscPoolAccount,
      true
    );

    const usdcBalance = (
      await connection.getTokenAccountBalance(usdcTokenAccount)
    ).value.uiAmount;
    const iscBalance = (
      await connection.getTokenAccountBalance(iscTokenAccount)
    ).value.uiAmount;

    api.add("So11111111111111111111111111111111111111112", sumDeployed);
    api.add("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", usdcBalance * 1e6 + sumOpenedPositions * 1e6);
    api.add("J9BcrQfX4p9D1bvLzRNCbMDv8f44a9LFdeqNE4Yk2WMD", iscBalance * 1e6);
    //return { solana: sumOpenedPositions };
  } catch (error) {
    console.error("Error fetching TVL:", error);
    return { solana: 0 };
  }
}

async function getAssociatedTokenAddress(
  mint,
  owner,
  allowOwnerOffCurve = false
) {
  if (!allowOwnerOffCurve && !PublicKey.isOnCurve(owner.toBuffer())) {
    throw new Error("Owner must be on curve");
  }
  const [associatedTokenAddress] = await PublicKey.findProgramAddressSync(
    [owner.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    SPL_ASSOCIATED_TOKEN_PROGRAM_ID
  );
  return associatedTokenAddress;
}

function chunk(array, size) {
  const chunkedArray = [];
  for (let i = 0; i < array.length; i += size) {
    chunkedArray.push(array.slice(i, i + size));
  }
  return chunkedArray;
}

function generateListOfPriceURLs(chunkedPairs) {
  return chunkedPairs.map((chunk) => {
    return `https://api.jup.ag/price/v2?ids=${chunk.join(
      ","
    )}&vsToken=${"EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"}`;
  });
}

async function fetchCollateralPrices(collateralTokenIds) {
  const chunks = chunk(collateralTokenIds, 100);
  const priceUrls = generateListOfPriceURLs(chunks);
  const prices = (
    await Promise.all(
      priceUrls.map(async (url) => {
        const response = await axios.get(url);
        return response.data.data;
      })
    )
  ).reduce((acc, priceData) => {
    Object.keys(priceData).forEach((key) => {
      acc[key] = priceData[key]?.price || 1;
    });
    return acc;
  }, {});

  return prices;
}

async function getPoolCollateralMap(programId) {
  // Initialize the program with the specific program ID
  const programWithId = new anchor.Program(
    lavarageIDL,
    programId,
    getProvider()
  );

  // Fetch all pool accounts for the given program ID
  const pools = await programWithId.account.pool.all([]);

  // Create a map of collateralType to pool ID
  const collateralMap = {};
  pools.forEach((pool) => {
    const collateralType = pool.account.collateralType?.toBase58();
    const poolId = pool.publicKey.toBase58();
    if (collateralType) {
      collateralMap[poolId] = collateralType;
    }
  });
  return collateralMap;
}

async function fetchCollateralPricesFromPools() {
  // Fetch pool maps for both SOL and USDC program IDs
  const solCollateralMap = await getPoolCollateralMap(solProgramId);
  const usdcCollateralMap = await getPoolCollateralMap(usdcProgramId);

  // Merge the two collateral maps
  const collateralMap = { ...solCollateralMap, ...usdcCollateralMap };

  // Extract unique collateralToken IDs
  const collateralTokenIds = Object.values(collateralMap);

  // Fetch prices for these collateral tokens
  const prices = await fetchCollateralPrices(collateralTokenIds);

  // Create a map of decimal places for each collateral token
  const decimalPlacesMap = {};
  const connection = getConnection();
  
  // Fetch mint info for all collateral tokens
  const mintInfos = await Promise.all(
    collateralTokenIds.map(async (tokenId) => {
      try {
        const token = new splToken.Token(connection, new PublicKey(tokenId), TOKEN_PROGRAM_ID, getProvider().wallet);
        const mintInfo = await token.getMintInfo();
        return {
          tokenId,
          decimals: mintInfo.decimals
        };
      } catch (e) {
        console.log(`Error fetching decimals for token ${tokenId}`, e);
        return {
          tokenId,
          decimals: 0
        };
      }
    })
  );

  // Populate the decimals map
  mintInfos.forEach(({ tokenId, decimals }) => {
    decimalPlacesMap[tokenId] = decimals;
  });

  return { prices, collateralMap, decimalPlacesMap };
}

async function getStakingAccounts(anchor) {
  const dataAccount = (await anchor.account.dataAccount.all())[0];
  return dataAccount.account.whitelistedStakeAccounts.map((pubkey) => {
    return { pubkey, isSigner: false, isWritable: false };
  });
}

async function getSumOpenedPositions(
  solProgram,
  usdcProgram,
  prices,
  collateralMap,
  decimalPlacesMap
) {
  const solPositions = await fetchUserPositions(solProgram);
  const usdcPositions = await fetchUserPositions(usdcProgram);
  const positionsRaw = [...solPositions, ...usdcPositions];
  const userPositions = positionsRaw.map(deserializePosition).filter((p) => p);
  const activePositions = userPositions.filter(
    (p) =>
      p.closeStatusRecallTimestamp === "0" ||
      isWithinEdgeCaseTimeRange(p.timestamp)
  );

  return activePositions.reduce((total, position) => {
    const poolAddress = position.pool;
    const collateralPrice = prices[collateralMap[poolAddress]] || 1;
    const collateralAmount = parseFloat(position.collateralAmount);
    const decimals = decimalPlacesMap[collateralMap[poolAddress]] || 0;
    return total + (collateralAmount * collateralPrice / 10 ** decimals);
  }, 0);
}

function isWithinEdgeCaseTimeRange(closeTimestamp) {
  return edgeCaseTimestamps.some(
    ({ start, end }) => closeTimestamp >= start && closeTimestamp <= end
  );
}

async function fetchPools(anchor) {
  return await anchor.account.pool.all([
    {
      memcmp: {
        offset: 49,
        bytes: "6riP1W6R3qzUPWYwLGtXEC23aTqmyAEdDtXzhntJquAh",
      },
    },
  ]);
}

async function fetchUserPositions(anchor) {
  const poolsAddresses = (await fetchPools(anchor)).map((p) =>
    p.publicKey.toBase58()
  );
  const value = BigInt(9999);
  const valueBuffer = Buffer.alloc(8);
  valueBuffer.writeBigUInt64LE(value, 0);
  return (
    await anchor.account.position.all([
      { dataSize: 178 },
      {
        memcmp: {
          offset: 40,
          bytes: bs58.encode(Buffer.from(new Uint8Array(8))),
        },
      },
    ])
  )
    .concat(
      await anchor.account.position.all([
        { dataSize: 178 },
        {
          memcmp: {
            offset: 40,
            bytes: bs58.encode(valueBuffer),
          },
        },
      ])
    )
    .filter((pos) => poolsAddresses.includes(pos.account.pool.toBase58()));
}

const deserializePosition = (position) => {
  const {
    amount,
    collateralAmount,
    closeStatusRecallTimestamp,
    timestamp,
    trader,
  } = position.account;
  const publicKey = position.publicKey;
  return {
    amount,
    collateralAmount: collateralAmount.toString(),
    closeStatusRecallTimestamp: closeStatusRecallTimestamp.toString(),
    timestamp: timestamp.toNumber(),
    publicKey: publicKey.toBase58(),
    trader: trader.toBase58(),
    pool: position.account.pool.toBase58(),
    userPaid: position.account.userPaid.toNumber(),
    seed: position.account.seed,
    closeTimestamp: position.account.closeTimestamp.toNumber(),
    closingPositionSize: position.account.closingPositionSize.toNumber(),
    interestRate: position.account.interestRate,
    accruedInterest: 0,
  };
};

module.exports = {
  timetravel: false,
  solana: {
    tvl,
  },
};

const lavarageIDL = {
  version: "0.1.0",
  name: "lavarage",
  instructions: [
    {
      name: "lpOperatorCreateTradingPool",
      accounts: [
        {
          name: "tradingPool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "operator",
          isMut: true,
          isSigner: true,
        },
        {
          name: "nodeWallet",
          isMut: false,
          isSigner: false,
        },
        {
          name: "mint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "interestRate",
          type: "u8",
        },
      ],
    },
    {
      name: "lpOperatorCreateNodeWallet",
      accounts: [
        {
          name: "nodeWallet",
          isMut: true,
          isSigner: true,
        },
        {
          name: "operator",
          isMut: true,
          isSigner: true,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "lpOperatorFundNodeWallet",
      accounts: [
        {
          name: "nodeWallet",
          isMut: true,
          isSigner: false,
        },
        {
          name: "funder",
          isMut: true,
          isSigner: true,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "amount",
          type: "u64",
        },
      ],
    },
    {
      name: "lpOperatorWithdrawFromNodeWallet",
      accounts: [
        {
          name: "nodeWallet",
          isMut: true,
          isSigner: false,
        },
        {
          name: "funder",
          isMut: true,
          isSigner: true,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "amount",
          type: "u64",
        },
      ],
    },
    {
      name: "lpOperatorUpdateMaxBorrow",
      accounts: [
        {
          name: "tradingPool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "nodeWallet",
          isMut: false,
          isSigner: false,
        },
        {
          name: "operator",
          isMut: true,
          isSigner: true,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "amount",
          type: "u64",
        },
      ],
    },
    {
      name: "lpOperatorUpdateMaxExposure",
      accounts: [
        {
          name: "tradingPool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "nodeWallet",
          isMut: false,
          isSigner: false,
        },
        {
          name: "operator",
          isMut: true,
          isSigner: true,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "amount",
          type: "u64",
        },
      ],
    },
    {
      name: "lpOperatorUpdateInterestRate",
      accounts: [
        {
          name: "tradingPool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "nodeWallet",
          isMut: false,
          isSigner: false,
        },
        {
          name: "operator",
          isMut: true,
          isSigner: true,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "amount",
          type: "u8",
        },
      ],
    },
    {
      name: "lpLiquidate",
      accounts: [
        {
          name: "mint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "positionAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "trader",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tradingPool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "fromTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "toTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "nodeWallet",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "randomAccountAsId",
          isMut: false,
          isSigner: false,
        },
        {
          name: "clock",
          isMut: false,
          isSigner: false,
        },
        {
          name: "operator",
          isMut: false,
          isSigner: true,
        },
        {
          name: "oracle",
          isMut: false,
          isSigner: true,
        },
      ],
      args: [
        {
          name: "positionSize",
          type: "u64",
        },
      ],
    },
    {
      name: "lpCollectInterest",
      accounts: [
        {
          name: "mint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "positionAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "trader",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tradingPool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "fromTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "toTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "nodeWallet",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "randomAccountAsId",
          isMut: false,
          isSigner: false,
        },
        {
          name: "clock",
          isMut: false,
          isSigner: false,
        },
        {
          name: "operator",
          isMut: false,
          isSigner: true,
        },
        {
          name: "oracle",
          isMut: false,
          isSigner: true,
        },
      ],
      args: [
        {
          name: "price",
          type: "u128",
        },
      ],
    },
    {
      name: "tradingOpenBorrow",
      accounts: [
        {
          name: "positionAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "trader",
          isMut: true,
          isSigner: true,
        },
        {
          name: "tradingPool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "nodeWallet",
          isMut: true,
          isSigner: false,
        },
        {
          name: "instructions",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "clock",
          isMut: false,
          isSigner: false,
        },
        {
          name: "randomAccountAsId",
          isMut: false,
          isSigner: false,
        },
        {
          name: "feeReceipient",
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "positionSize",
          type: "u64",
        },
        {
          name: "userPays",
          type: "u64",
        },
      ],
    },
    {
      name: "tradingOpenAddCollateral",
      accounts: [
        {
          name: "positionAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "trader",
          isMut: true,
          isSigner: true,
        },
        {
          name: "tradingPool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "mint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "toTokenAccount",
          isMut: false,
          isSigner: false,
        },
        {
          name: "randomAccountAsId",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "maxInterestRate",
          type: "u8",
        },
      ],
    },
    {
      name: "tradingCloseBorrowCollateral",
      accounts: [
        {
          name: "positionAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "trader",
          isMut: true,
          isSigner: true,
        },
        {
          name: "tradingPool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "instructions",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "mint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "fromTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "toTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "clock",
          isMut: false,
          isSigner: false,
        },
        {
          name: "randomAccountAsId",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "tradingDataAccruedInterest",
      accounts: [
        {
          name: "positionAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "trader",
          isMut: true,
          isSigner: true,
        },
        {
          name: "tradingPool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "nodeWallet",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "clock",
          isMut: false,
          isSigner: false,
        },
        {
          name: "randomAccountAsId",
          isMut: false,
          isSigner: false,
        },
        {
          name: "feeReceipient",
          isMut: true,
          isSigner: false,
        },
      ],
      args: [],
      returns: "u64",
    },
    {
      name: "tradingCloseRepaySol",
      accounts: [
        {
          name: "positionAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "trader",
          isMut: true,
          isSigner: true,
        },
        {
          name: "tradingPool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "nodeWallet",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "clock",
          isMut: false,
          isSigner: false,
        },
        {
          name: "randomAccountAsId",
          isMut: false,
          isSigner: false,
        },
        {
          name: "feeReceipient",
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "closingPositionSize",
          type: "u64",
        },
        {
          name: "closeType",
          type: "u64",
        },
      ],
    },
  ],
  accounts: [
    {
      name: "nodeWallet",
      type: {
        kind: "struct",
        fields: [
          {
            name: "totalFunds",
            type: "u64",
          },
          {
            name: "totalBorrowed",
            type: "u64",
          },
          {
            name: "maintenanceLtv",
            type: "u8",
          },
          {
            name: "liquidationLtv",
            type: "u8",
          },
          {
            name: "nodeOperator",
            type: "publicKey",
          },
        ],
      },
    },
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
  types: [
    {
      name: "LendingErrors",
      docs: ["Errors for this program"],
      type: {
        kind: "enum",
        variants: [
          {
            name: "AddressMismatch",
          },
          {
            name: "ProgramMismatch",
          },
          {
            name: "MissingRepay",
          },
          {
            name: "IncorrectOwner",
          },
          {
            name: "IncorrectProgramAuthority",
          },
          {
            name: "CannotBorrowBeforeRepay",
          },
          {
            name: "UnknownInstruction",
          },
          {
            name: "ExpectedCollateralNotEnough",
          },
        ],
      },
    },
    {
      name: "ErrorCode",
      type: {
        kind: "enum",
        variants: [
          {
            name: "InvalidSignature",
          },
          {
            name: "InvalidOracle",
          },
        ],
      },
    },
    {
      name: "PositionCloseType",
      type: {
        kind: "enum",
        variants: [
          {
            name: "ClosedByUser",
          },
          {
            name: "Liquidated",
          },
        ],
      },
    },
  ],
  events: [
    {
      name: "PositionCloseEvent",
      fields: [
        {
          name: "pool",
          type: "publicKey",
          index: false,
        },
        {
          name: "amount",
          type: "u64",
          index: false,
        },
        {
          name: "userPaid",
          type: "u64",
          index: false,
        },
        {
          name: "collateralAmount",
          type: "u64",
          index: false,
        },
        {
          name: "openTimestamp",
          type: "i64",
          index: false,
        },
        {
          name: "trader",
          type: "publicKey",
          index: false,
        },
        {
          name: "closeType",
          type: "u8",
          index: false,
        },
        {
          name: "closeTimestamp",
          type: "i64",
          index: false,
        },
        {
          name: "closingPositionSize",
          type: "u64",
          index: false,
        },
      ],
    },
    {
      name: "PositionOpenEvent",
      fields: [
        {
          name: "pool",
          type: "publicKey",
          index: false,
        },
        {
          name: "amount",
          type: "u64",
          index: false,
        },
        {
          name: "userPaid",
          type: "u64",
          index: false,
        },
        {
          name: "collateralAmount",
          type: "u64",
          index: false,
        },
        {
          name: "openTimestamp",
          type: "i64",
          index: false,
        },
        {
          name: "trader",
          type: "publicKey",
          index: false,
        },
      ],
    },
  ],
  errors: [
    {
      code: 6000,
      name: "AddressMismatch",
      msg: "Address Mismatch",
    },
    {
      code: 6001,
      name: "ProgramMismatch",
      msg: "Program Mismatch",
    },
    {
      code: 6002,
      name: "MissingRepay",
      msg: "Missing Repay",
    },
    {
      code: 6003,
      name: "IncorrectOwner",
      msg: "Incorrect Owner",
    },
    {
      code: 6004,
      name: "IncorrectProgramAuthority",
      msg: "Incorrect Program Authority",
    },
    {
      code: 6005,
      name: "CannotBorrowBeforeRepay",
      msg: "Cannot Borrow Before Repay",
    },
    {
      code: 6006,
      name: "UnknownInstruction",
      msg: "Unknown Instruction",
    },
    {
      code: 6007,
      name: "ExpectedCollateralNotEnough",
      msg: "Expected collateral not enough",
    },
    {
      code: 6008,
      name: "ForTesting",
      msg: "TestError",
    },
  ],
};

const stakingIDL = {
  version: "0.1.0",
  name: "staking",
  instructions: [
    {
      name: "mockNodeWallet",
      accounts: [
        {
          name: "newAccount",
          isMut: true,
          isSigner: true,
        },
        {
          name: "bank",
          isMut: true,
          isSigner: true,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "updateNav",
      accounts: [
        {
          name: "data",
          isMut: true,
          isSigner: false,
        },
        {
          name: "oracle",
          isMut: false,
          isSigner: true,
          docs: ["Oracle will not sign if there are unsold collateral"],
        },
      ],
      args: [
        {
          name: "dailyNav",
          type: "u64",
        },
        {
          name: "dailyNavAdjusted",
          type: "u64",
        },
      ],
    },
    {
      name: "createDataAccount",
      accounts: [
        {
          name: "newAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "bank",
          isMut: true,
          isSigner: true,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "mint",
          isMut: true,
          isSigner: false,
        },
        {
          name: "toTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "initialMint",
          type: "u64",
        },
        {
          name: "adjustment",
          type: "i64",
        },
      ],
    },
    {
      name: "updateWhitelistedStakesSize",
      accounts: [
        {
          name: "data",
          isMut: true,
          isSigner: false,
        },
        {
          name: "updater",
          isMut: true,
          isSigner: true,
        },
      ],
      args: [],
    },
    {
      name: "updateWhitelistedStakes",
      accounts: [
        {
          name: "data",
          isMut: true,
          isSigner: false,
        },
        {
          name: "updater",
          isMut: true,
          isSigner: true,
        },
      ],
      args: [],
    },
    {
      name: "stake",
      accounts: [
        {
          name: "data",
          isMut: true,
          isSigner: false,
        },
        {
          name: "depositor",
          isMut: true,
          isSigner: true,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "mint",
          isMut: true,
          isSigner: false,
        },
        {
          name: "oracle",
          isMut: false,
          isSigner: true,
          docs: ["Oracle will not sign if there are unsold collateral"],
        },
        {
          name: "multiSig",
          isMut: true,
          isSigner: false,
        },
        {
          name: "toTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "nodeWallet",
          isMut: false,
          isSigner: false,
        },
        {
          name: "idleFunds",
          isMut: false,
          isSigner: false,
        },
        {
          name: "maxBidMint",
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "solAmount",
          type: "u64",
        },
        {
          name: "currentNav",
          type: "u64",
        },
      ],
    },
    {
      name: "maxBidS",
      accounts: [
        {
          name: "data",
          isMut: true,
          isSigner: false,
        },
        {
          name: "depositor",
          isMut: true,
          isSigner: true,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "mint",
          isMut: true,
          isSigner: false,
        },
        {
          name: "oracle",
          isMut: false,
          isSigner: true,
          docs: ["Oracle will not sign if there are unsold collateral"],
        },
        {
          name: "multiSig",
          isMut: true,
          isSigner: false,
        },
        {
          name: "toTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "nodeWallet",
          isMut: false,
          isSigner: false,
        },
        {
          name: "idleFunds",
          isMut: false,
          isSigner: false,
        },
        {
          name: "maxBidMint",
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "solAmount",
          type: "u64",
        },
        {
          name: "currentNav",
          type: "u64",
        },
      ],
    },
    {
      name: "unstake",
      accounts: [
        {
          name: "data",
          isMut: true,
          isSigner: false,
        },
        {
          name: "unstakeAccount",
          isMut: true,
          isSigner: true,
        },
        {
          name: "depositor",
          isMut: true,
          isSigner: true,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "mint",
          isMut: true,
          isSigner: false,
        },
        {
          name: "oracle",
          isMut: false,
          isSigner: true,
          docs: ["Oracle will not sign if there are unsold collateral"],
        },
        {
          name: "fromTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "nodeWallet",
          isMut: false,
          isSigner: false,
        },
        {
          name: "multiSig",
          isMut: false,
          isSigner: false,
        },
        {
          name: "idleFunds",
          isMut: false,
          isSigner: false,
        },
        {
          name: "maxBidMint",
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "lstAmount",
          type: "u64",
        },
        {
          name: "currentNav",
          type: "u64",
        },
      ],
    },
    {
      name: "maxBidU",
      accounts: [
        {
          name: "data",
          isMut: true,
          isSigner: false,
        },
        {
          name: "unstakeAccount",
          isMut: true,
          isSigner: true,
        },
        {
          name: "depositor",
          isMut: true,
          isSigner: true,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "mint",
          isMut: true,
          isSigner: false,
        },
        {
          name: "oracle",
          isMut: false,
          isSigner: true,
          docs: ["Oracle will not sign if there are unsold collateral"],
        },
        {
          name: "fromTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "nodeWallet",
          isMut: false,
          isSigner: false,
        },
        {
          name: "multiSig",
          isMut: false,
          isSigner: false,
        },
        {
          name: "idleFunds",
          isMut: false,
          isSigner: false,
        },
        {
          name: "maxBidMint",
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "lstAmount",
          type: "u64",
        },
        {
          name: "currentNav",
          type: "u64",
        },
      ],
    },
    {
      name: "claim",
      accounts: [
        {
          name: "data",
          isMut: true,
          isSigner: false,
        },
        {
          name: "unstakeAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "depositor",
          isMut: true,
          isSigner: true,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
  ],
  accounts: [
    {
      name: "nodeWallet",
      type: {
        kind: "struct",
        fields: [
          {
            name: "totalFunds",
            type: "u64",
          },
          {
            name: "totalBorrowed",
            type: "u64",
          },
          {
            name: "maintenanceLtv",
            type: "u8",
          },
          {
            name: "liquidationLtv",
            type: "u8",
          },
          {
            name: "nodeOperator",
            type: "publicKey",
          },
        ],
      },
    },
    {
      name: "dataAccount",
      type: {
        kind: "struct",
        fields: [
          {
            name: "borrowedAmountAdjustment",
            type: "i64",
          },
          {
            name: "dailyNav",
            type: "u64",
          },
          {
            name: "mint",
            type: "publicKey",
          },
          {
            name: "pendingUnstake",
            type: "u64",
          },
          {
            name: "dailyNavAdjusted",
            type: "u64",
          },
          {
            name: "prevDailyNav",
            type: "u64",
          },
          {
            name: "whitelistedStakeAccounts",
            type: {
              vec: "publicKey",
            },
          },
        ],
      },
    },
    {
      name: "unstakeAccount",
      type: {
        kind: "struct",
        fields: [
          {
            name: "pendingUnstakeSol",
            type: "u64",
          },
          {
            name: "unstakeTimestamp",
            type: "i64",
          },
          {
            name: "depositor",
            type: "publicKey",
          },
        ],
      },
    },
  ],
};
