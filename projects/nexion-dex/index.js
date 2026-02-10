const { sumTokens2 } = require("../helper/unwrapLPs");

// veNEON Voting Escrow - users lock NEON for veNEON NFTs
const VE_NEON = "0x15Fc4C8df3ED16049E11134054C40c1E6D9107e3";
const NEON = "0xF2Da3942616880E52e841E5C504B5A9Fba23FFF0";

// AURA DEX pools (Solidly-style ve(3,3) AMM) - pool address -> gauge address
const POOLS = [
  { pool: "0xaA86C8e1a71D8fBF36a0E04dc7C06F2cd51f0824", gauge: "0x65F3Ecd8f2F03c4e794cdB732324b691e35FAC6D" }, // NEON/WPLS
  { pool: "0x51637B8c1CD71e5ec2fA0b0db7e732f4B9192A83", gauge: "0x1253035a8762f6b4dDDD10ae09A6B1C111756396" }, // WPLS/DAI
  { pool: "0xb5ef5F856E21262d2303aCac4D516543D1f961eE", gauge: "0xFB1d9A78d472183D5539c4A0a65bAC6dDf841110" }, // WPLS/USDC
  { pool: "0x1543DB2C0fDd837F8471B2a01D6358fbC13787C4", gauge: "0xAc762349bAd61cD104D643a65115008254471A52" }, // WPLS/USDT
  { pool: "0xE3878d050E2F90508181BFC7C00aA1677E23d5B9", gauge: "0x9236987F19B9cC60757FD30C57909aBbe0e17155" }, // WPLS/HEX
  { pool: "0x2E936eB2bf29798439D1d8c208b380183976C685", gauge: "0x453C05F616B70604B6E6aAeA048B1703174FdE49" }, // WPLS/PLSX
  { pool: "0x80287aACD62304f8dE01EDf65074c916EF492eDC", gauge: "0xbFa5F82D16b31079a398CFe4e56E885Ad5EC445B" }, // DAI/USDC
  { pool: "0x6B3741C6e25cDeFe401b5c1001e7D33656e0Db23", gauge: "0xc438F6a264322DCA0663b879C1aF70c652da5e4B" }, // USDC/USDT
];

async function tvl(api) {
  // Get token0 and token1 for each pool
  const poolAddresses = POOLS.map((p) => p.pool);
  const [token0s, token1s] = await Promise.all([
    api.multiCall({ abi: "address:token0", calls: poolAddresses }),
    api.multiCall({ abi: "address:token1", calls: poolAddresses }),
  ]);

  // Sum token balances held by each pool contract (total DEX liquidity)
  const tokensAndOwners = [];
  poolAddresses.forEach((pool, i) => {
    tokensAndOwners.push([token0s[i], pool]);
    tokensAndOwners.push([token1s[i], pool]);
  });

  return sumTokens2({ api, tokensAndOwners });
}

async function staking(api) {
  // NEON locked in the VotingEscrow contract
  return sumTokens2({ api, tokensAndOwners: [[NEON, VE_NEON]] });
}

module.exports = {
  methodology:
    "TVL is the total liquidity in AURA DEX pools (Nexion ve(3,3) AMM). Staking is the total NEON locked in the VotingEscrow (veNEON).",
  pulse: {
    tvl,
    staking,
  },
};
