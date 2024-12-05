const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokensExport } = require("../helper/unwrapLPs");
const { getProvider, Program } = require("@project-serum/anchor");
const { Connection, PublicKey } = require("@solana/web3.js");

const config = {
  ethereum: {
    owners: Object.values({
      predictionPROV2: "0x062EB9830D1f1f0C64ac598eC7921f0cbD6d4841",
      predictionPROV3: "0x792b18ec0d39093f10f8b34676e2f8669a495e9b",
    }),
    tokens: [ADDRESSES.null, ADDRESSES.ethereum.USDT, ADDRESSES.ethereum.USDC],
  },
  arbitrum: {
    owners: Object.values({
      predictionPROV2: "0x062EB9830D1f1f0C64ac598eC7921f0cbD6d4841",
      predictionPROV3: "0xe2ca0a434effea151d5b2c649b754acd3c8a20f0",
    }),
    tokens: [
      ADDRESSES.null,
      ADDRESSES.arbitrum.USDT,
      ADDRESSES.arbitrum.USDC_CIRCLE,
    ],
  },
  bsc: {
    owners: Object.values({
      predictionBNB: "0x31B8A8Ee92961524fD7839DC438fd631D34b49C6",
      predictionETH: "0xE39A6a119E154252214B369283298CDF5396026B",
      predictionBTC: "0x3Df33217F0f82c99fF3ff448512F22cEf39CC208",
      predictionPRO: "0x599974D3f2948b50545Fb5aa77C9e0bddc230ADE",
      predictionPROV2: "0x22dB94d719659d7861612E0f43EE28C9FF9909C7",
      predictionclassicV3: "0x00199E444155f6a06d74CF36315419d39b874f5c",
      predictionPROV3: "0x49eFb44831aD88A9cFFB183d48C0c60bF4028da8",
    }),
    tokens: [
      ADDRESSES.null,
      ADDRESSES.bsc.USDT,
      ADDRESSES.bsc.USDC,
      ADDRESSES.bsc.ETH,
    ],
  },
  polygon: {
    owners: Object.values({
      predictionBTCPOLY: "0xd71b0366CD2f2E90dd1F80A1F0EA540F73Ac0EF6",
      predictionMATIC: "0x59e0aD27d0F58A15128051cAA1D2917aA71AB864",
      predictionPRO: "0x764C3Ea13e7457261E5C1AaD597F281f3e738240",
      predictionPROV2: "0x8251E5EBc2d2C20f6a116144800D569FAF75d746",
      predictionclassicv3: "0x9f9564BE7b566dfE4B091a83a591752102aF3F33",
      predictionPROV3: "0x0b9c8c0a04354f41b985c10daf7db30bc66998f5",
    }),
    tokens: [
      ADDRESSES.null,
      ADDRESSES.polygon.USDT,
      ADDRESSES.polygon.USDC_CIRCLE,
      ADDRESSES.polygon.WETH,
    ],
  },
  solana: {},
};

const tokenMapping = {
  So11111111111111111111111111111111111111112: "solana", // Native SOL
  Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB: "tether", // USDT
  EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: "usd-coin", // USDC
};

Object.keys(config).forEach((chain) => {
  if (chain === "solana") {
    module.exports[chain] = {
      tvl: async (_, _1, _2, { api }) => {
        try {
          const connection = new Connection(
            "https://api.mainnet-beta.solana.com",
            "confirmed"
          );
          const owner = new PublicKey(
            "CcccPbvfmpNE5q4JFS5qU3mszP8obUy5Fp2BQ6Hm9Mnp"
          );

          // Get SOL balance in lamports and convert to SOL
          const solBalanceLamports = await connection.getBalance(owner);
          const solBalance = solBalanceLamports / 1e9; // Convert lamports to SOL

          const balances = {};
          // Add SOL balance with coingecko ID
          balances[
            tokenMapping["So11111111111111111111111111111111111111112"]
          ] = solBalance;

          // Get token accounts
          const accounts = await connection.getParsedTokenAccountsByOwner(
            owner,
            {
              programId: new PublicKey(
                "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
              ),
            }
          );

          // Add token balances with coingecko IDs
          accounts.value.forEach(({ account }) => {
            const parsedInfo = account.data.parsed.info;
            const mintAddress = parsedInfo.mint;
            const balance =
              Number(parsedInfo.tokenAmount.amount) /
              10 ** (parsedInfo.tokenAmount.decimals || 0);

            if (balance > 0 && tokenMapping[mintAddress]) {
              balances[tokenMapping[mintAddress]] =
                (balances[tokenMapping[mintAddress]] || 0) + balance;
            }
          });

          return balances;
        } catch (e) {
          console.error("Solana TVL error:", e);
          return {};
        }
      },
    };
  } else {
    module.exports[chain] = { tvl: sumTokensExport(config[chain]) };
  }
});
