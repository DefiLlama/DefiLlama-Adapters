const abi = {
    "LPtoken": "address:LPtoken",
    "balanceLPinSystem": "uint256:balanceLPinSystem",
    "stakingToken": "address:stakingToken"
  };
const { sumTokens2 } = require("../helper/unwrapLPs");

const coreRewards = "0xE006716Ae6cAA486d77084C1cca1428fb99c877B";
const avaxRewards = "0x6140D3ED2426cbB24f07D884106D9018d49d9101";
const CYCLE = "0x81440C939f2C1E34fc7048E518a637205A632a74";

const vaults = [
  //Pangolin Rewards AVAX/PNG
  "0xccB42c29285754f441Dc6A4461De011efCD09F75",

  //Gondola Rewards AVAX/GDL
  "0x47de256F890d3707aad74A89C6b532eEAaAe54BA",

  //Penguin Rewards AVAX/PEFI
  "0x1ee6ed952E71cd3d1D473a596a6761B1a1D704e0",

  //Penguin Rewards PEFI/DAI
  "0xB0B55192aA1539f06eBAC509bf714261358A997a",

  //Olive Rewards AVAX/OLIVE
  "0xCD1eee22a0Ec06f5D169753cc1B1CC0C57513B24",

  //Avaware Rewards AVAX/AVE
  "0x950bF2fb93c4Cb8CaBc7A08eb8A70Ea3c4A2bcC2",

  //Trader Joe Rewards AVAX/JOE
  "0xB19bFa46148636C97B0C00A68B24647f60C1995D",

  //Trader Joe Rewards AVAX/SNOB
  "0x16aB820ABB64BcE04d15de945c18c0CC31822514",

  //Olive Rewards AVAX/CYCLE
  "0x01181D0E43c1A77f111C7968BE5B7e40F1D6e106",

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
const staking = async (api) => {
  const staking_lpToken = await api.call({ abi: abi.stakingToken, target: coreRewards, })
  return sumTokens2({ api, tokens: [CYCLE, staking_lpToken], owners: [coreRewards, avaxRewards] })
};

const avaxTvl = async (api) => {
  const lpTokens = await api.multiCall({ abi: abi.LPtoken, calls: vaults, })
  const lpTokens_bal = await api.multiCall({ abi: abi.balanceLPinSystem, calls: vaults, })
  api.add(lpTokens, lpTokens_bal)
  return sumTokens2({ api, resolveLP: true,})
};

module.exports = {
  doublecounted: true,
  misrepresentedTokens: true,
  avax: {
    tvl: avaxTvl,
    staking
  },
  methodology: `We add liquidity that is on the VAULTS threw their contracts and the portion of staking the native token (CYCLE) 
    && CYCLE/AVAX LP by coreRewards and avaxRewards contracts respectivly`,
};
