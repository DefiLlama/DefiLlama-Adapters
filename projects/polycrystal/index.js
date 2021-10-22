const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const erc20 = require("../helper/abis/erc20.json");

const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { transformPolygonAddress } = require("../helper/portedTokens");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");

const MasterHealer = "0xeBCC84D2A73f0c9E23066089C6C24F4629Ef1e6d";

const CrystalMine = "0x5BaDd6C71fFD0Da6E4C7D425797f130684D057dd";
const CRYSTAL = "0x76bf0c28e604cc3fe9967c83b3c3f31c213cfe64";

const treasuryAddress = "0x5386881b46C37CdD30A748f7771CF95D7B213637";
const erc20Tokens = [
  //WMATIC
  "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
  //SNX
  "0x50b728d8d964fd00c2d0aad81718b71311fef68a",
  //DAI
  "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063",
  //CRV
  "0x172370d5cd63279efa6d502dab29171933a610af",
  //USDC
  "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619",
  //USDT
  "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
  //AAVE
  "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
  //LINK
  "0xd6df932a45c0f255f85145f286ea0b292b21c90b",
  //MANA
  "0x53e0bca35ec356bd5dddfebbd1fc0fd03fabad39",
  //WETH
  "0xa1c57f48f0deb89f569dfbe6e2b7f46d33606fd4",
  //FISH
  "0x3a3df212b7aa91aa0402b9035b098891d276572b",
  //ROLL
  "0xc68e83a305b0fad69e264a1769a0a070f190d2d6",
  //TITAN
  "0xaaa5b9e6c589642f98a1cda99b9d024b8407285a",
];

/*** Treasury ***/
const Treasury = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  const transformAddress = await transformPolygonAddress();

  for (const token of erc20Tokens) {
    await sumTokensAndLPsSharedOwners(
      balances,
      [[token, false]],
      [treasuryAddress],
      chainBlocks["polygon"],
      "polygon",
      transformAddress
    );
  }
  return balances;
};

/*** Staking of native token CRYSTAL TVL Portion ***/
const staking = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  const bal = (
    await sdk.api.abi.call({
      abi: abi.balanceOf,
      target: CrystalMine,
      chain: "polygon",
      block: chainBlocks["polygon"],
    })
  ).output;

  sdk.util.sumSingleBalance(balances, `polygon:${CRYSTAL}`, bal);

  return balances;
};

const polygonTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  const poolLength = (
    await sdk.api.abi.call({
      abi: abi.poolLength,
      target: MasterHealer,
      chain: "polygon",
      block: chainBlocks["polygon"],
    })
  ).output;

  const lpPositions = [];

  for (let index = 0; index < poolLength; index++) {
    const lpsOrTokens = (
      await sdk.api.abi.call({
        abi: abi.poolInfo,
        target: MasterHealer,
        params: index,
        chain: "polygon",
        block: chainBlocks["polygon"],
      })
    ).output.lpToken;

    const lpsOrTokens_Bal = (
      await sdk.api.abi.call({
        abi: erc20.balanceOf,
        target: lpsOrTokens,
        params: MasterHealer,
        chain: "polygon",
        block: chainBlocks["polygon"],
      })
    ).output;

    lpPositions.push({
      token: lpsOrTokens,
      balance: lpsOrTokens_Bal,
    });
  }

  const transformAddress = await transformPolygonAddress();

  await unwrapUniswapLPs(
    balances,
    lpPositions,
    chainBlocks["polygon"],
    "polygon",
    transformAddress
  );

  return balances;
};

module.exports = {
  misrepresentedTokens: true,
  treasury: {
    tvl: Treasury,
  },
  staking: {
    tvl: staking,
  },
  polygon: {
    tvl: polygonTvl,
  },
  tvl: sdk.util.sumChainTvls([Treasury]),
  methodology:
  `We count liquidity on the Vaults (LP tokens) and Mines (LP tokens) threw MasterHealer contract; 
  we add the staking of the native token (CRYSTAL) separate threw CrystalMine contract; 
  and the treasury part separate as well`,
};
