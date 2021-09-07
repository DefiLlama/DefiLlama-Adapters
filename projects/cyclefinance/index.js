const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { transformAvaxAddress } = require("../helper/portedTokens");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");

const coreRewards = "0xE006716Ae6cAA486d77084C1cca1428fb99c877B";
const avaxRewards = "0x6140D3ED2426cbB24f07D884106D9018d49d9101";
const CYCLE = "0x81440C939f2C1E34fc7048E518a637205A632a74";

const vaults = [
  //Pangolin Rewards AVAX/PNG
  "0xccB42c29285754f441Dc6A4461De011efCD09F75",

  //Pangolin Rewards AVAX/ETH (closed)
  //"0xfB6e16A64ccC23848eB2951B1068a27B1d06791d",

  //Gondola Rewards AVAX/GDL
  "0x47de256F890d3707aad74A89C6b532eEAaAe54BA",

  //Penguin Rewards AVAX/PEFI
  "0x1ee6ed952E71cd3d1D473a596a6761B1a1D704e0",

  //Penguin Rewards PEFI/DAI
  "0xB0B55192aA1539f06eBAC509bf714261358A997a",

  //Olive Rewards AVAX/OLIVE
  "0xCD1eee22a0Ec06f5D169753cc1B1CC0C57513B24",

  //Baguette Rewards WAVAX/BAG (closed)
  //"0x8D6D3131B7d01F4acE7c74E7EA999d301524B9F8",

  //Pangolin Rewards AVAX/VSO (closed)
  //"0x1e8864b21C980AaB05F3566B74aB1Aa9ec7dE948",

  //Pangolin Rewards PNG/VSO (closed)
  //"0xbD87717eAAE4F13dD5b55734a46fA49C519f9404",

  //Avaware Rewards AVAX/AVE
  "0x950bF2fb93c4Cb8CaBc7A08eb8A70Ea3c4A2bcC2",

  //Olive Rewards AVAX/HUSKY (closed)
  //"0x661FD8d23433E38f009FBc1e79910Fc0cAb2bC6D",

  //Trader Joe Rewards AVAX/JOE
  "0xB19bFa46148636C97B0C00A68B24647f60C1995D",

  //Trader Joe Rewards AVAX/ETH (closed)
  //"0xe10F1567f0354F3d7394CaA42B4e30d0f19AF907",

  //Trader Joe Rewards AVAX/SNOB
  "0x16aB820ABB64BcE04d15de945c18c0CC31822514",

  //Trader Joe Rewards DAI/USDT (closed)
  //"0x36EBd37960F37Ffb8EDDc6165b304dbB362Cd112",

  //Olive Rewards AVAX/CYCLE
  "0x01181D0E43c1A77f111C7968BE5B7e40F1D6e106",

  //Trader Joe Rewards AVAX/SHERPA (closed)
  //"0xE80504EF78403AD1753b7DE62653c09c0f9de584",

  //Avaware Rewards AVE/CYCLE
  "0x4762baf391Ca1A18f71320a6A09bCD2067EA32cA",

  //Avaware Rewards AVE/SHERPA
  "0x60B9Fa802C2Bf85203b22c2aC0A68948632bf1f1",

  //Avaware Rewards AVE/YAK
  "0xaA76c50B510A668F48E612f980C45DC9691b647A",

  //Pangolin Rewards AVAX/XAVA
  "0x13C9810d32bA9B7e51FeEf9aeF3b3D479efCfACC",

  //Pangolin Rewards AVAX/WETH.e
  "0x056b234bE3Aaa56506d484e17721Db0098e52474",

  //Trader Joe Rewards AVAX/WETH.e
  "0xc2C215d9263592665993eEfc77976e70590f0DF1",

  //Trader Joe Rewards DAI.e/USDT.e (Closed)
  //"0x313b8d1ca1aAfae10273cdfCFA083b9a0E272d0E",

  //Pangolin Rewards AVAX/DAI.e
  "0x4Fbb4C6dBD68A609780C79A18C04e5Ac52dD622C",

  //Pangolin Rewards AVAX/USDT.e
  "0xD65B47A5b6B6A07CFf8798AB54F136A0f05ADFF6",

  //Pangolin Rewards AVAX/QI
  "0x7754Be84f3305A12558e631e5df2A4DF474Cc046",

  //Trader Joe Rewards AVAX/USDT.e
  "0x1058B8eAC995968DE18d6a8baf36B3F6536a2Ca1",

  //Trader Joe Rewards AVAX/DAI.e
  "0x226C4E8758D37A151Fd01a46505A1D3C0dba3a24",

  //Trader Joe Rewards USDT.e/DAI.e
  "0x49D4663dBC92f4AfD0BE0459Ceb20F8e9F5a7118",

  //Trader Joe Rewards AVAX/LINK.e
  "0xd7d9151D1cB958F55cAc94196D03Ba267bc7d0dB",

  //Trader Joe Rewards AVAX/WBTC.e
  "0xc732a6aA22B60cEAA5c2193EF81D008658a20623",

  //Trader Joe Rewards AVAX/YAK
  "0x970C251E85CE1cE0b714de9510135a5B9Cd80b02",

  //Trader Joe Rewards AVAX/USDC.e
  "0xb5a23bdF77a8926E732ce4b1F0885e7bB3b2Dfe9",

  //Trader Joe Rewards USDC.e/DAI.e
  "0x32bdcdDA8eb152759c2F27D71e1F8d242D46D9Ca",
];

/*** Staking of native token CYCLE and CYCLE/AVAX LP TVL Portion ***/
const staking = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  const staking_lpToken = (
    await sdk.api.abi.call({
      abi: abi.stakingToken,
      target: coreRewards,
      chain: "avax",
      block: chainBlocks["avax"],
    })
  ).output;

  const cycleLpOrTokens = [
    [staking_lpToken, true],
    [CYCLE, false],
  ];

  const transformAddress = await transformAvaxAddress();

  for (const lpOrToken of cycleLpOrTokens) {
    await sumTokensAndLPsSharedOwners(
      balances,
      [lpOrToken],
      (lpOrToken[1] == true) ? [coreRewards] : [avaxRewards],
      chainBlocks["avax"],
      "avax",
      transformAddress
    );
  }
  return balances;
};

/*** vaults TVL portion ***/
const avaxTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  const lpTokens = (
    await sdk.api.abi.multiCall({
      abi: abi.LPtoken,
      calls: vaults.map((vault) => ({
        target: vault,
      })),
      chain: "avax",
      block: chainBlocks["avax"],
    })
  ).output.map((lp) => lp.output);

  const lpTokens_bal = (
    await sdk.api.abi.multiCall({
      abi: abi.balanceLPinSystem,
      calls: vaults.map((vault) => ({
        target: vault,
      })),
      chain: "avax",
      block: chainBlocks["avax"],
    })
  ).output.map((lpb) => lpb.output);

  const lpPositions = [];
  for (let index = 0; index < vaults.length; index++) {
    lpPositions.push({
      token: lpTokens[index],
      balance: lpTokens_bal[index],
    });
  }

  const transformAddress = await transformAvaxAddress();

  await unwrapUniswapLPs(
    balances,
    lpPositions,
    chainBlocks["avax"],
    "avax",
    transformAddress
  );

  return balances;
};

module.exports = {
  misrepresentedTokens: true,
  staking: {
    tvl: staking,
  },
  avax: {
    tvl: avaxTvl,
  },
  tvl: sdk.util.sumChainTvls([avaxTvl]),
  methodology: `We add liquidity that is on the VAULTS threw their contracts and the portion of staking the native token (CYCLE) 
    && CYCLE/AVAX LP by coreRewards and avaxRewards contracts respectivly`,
};
