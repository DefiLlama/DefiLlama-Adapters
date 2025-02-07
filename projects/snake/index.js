const { sumTokens2 } = require("../helper/unwrapLPs");


const gsnakeTokenAddress = "0x674a430f531847a6f8976A900f8ace765f896a1b";
const snakeGenesisAddress = '0x29D0762f7bE8409d0aC34A3595AF62E8c0120950'
const gsnakeRewardPoolAddress = "0xcfB9fDCd480Bc731833257eb982718cAb5aD2cE6";
const masonryAddress = "0x5A5d34826ab31003F26F8A15e9B645803d85eA81";
const chain = 'sonic'

const ftmLPs = [
  "0x287c6882dE298665977787e268f3dba052A6e251", // snake-s-lp
  "0xb901D7316447C84f4417b8a8268E2822095051E6", // gsnake-s-lp
];

async function pool2(timestamp, _b, { [chain]: block }) {
  return sumTokens2({
    chain, block, owner: gsnakeRewardPoolAddress, tokens: ftmLPs,
  })
}

async function staking(timestamp, _b, { [chain]: block }) {
  const toa = [
    [gsnakeTokenAddress, masonryAddress, ],
  ]

  const lif3Tokens = [
    '0x674a430f531847a6f8976A900f8ace765f896a1b', // GSNAKE
    '0x3a516e01f82c1e18916ED69a81Dd498eF64bB157', // SNAKE
  ]

  lif3Tokens.forEach(t => toa.push([t, snakeGenesisAddress]))
  
  return sumTokens2({
    chain, block, tokensAndOwners: toa,
  })
}

async function snakeGenesisTVL(timestamp, _b, { [chain]: block }) {
  const tokens = [
    "0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38", // S
    "0x29219dd400f2Bf60E5a23d13Be72B486D4038894", // USDC.e
    "0x50c42dEAcD8Fc9773493ED674b675bE577f2634b", // WETH
    "0x3333b97138D4b086720b5aE8A7844b1345a33333", // SHADOW
    "0x79bbF4508B1391af3A0F4B30bb5FC4aa9ab0E07C", // ANON
    "0xd3DCe716f3eF535C5Ff8d041c1A41C3bd89b97aE", // scUSD
    "0x9fDbC3f8Abc05Fa8f3Ad3C17D2F806c1230c4564", // GOGLZ
    "0x44E23B1F3f4511b3a7e81077Fd9F2858dF1B7579", // MCLB
    "0xE5DA20F15420aD15DE0fa650600aFc998bbE3955", // stS
    "0x3333111A391cC08fa51353E9195526A70b333333", // x33
  ]
  
  return sumTokens2({
    chain, block, tokens, owner: snakeGenesisAddress,
  })
}


module.exports = {
  methodology: "Pool2 deposits consist of SNAKE/S and GSNAKE/S LP tokens deposits while the staking TVL consists of the GSNAKEs tokens locked within the Masonry contract(0x5A5d34826ab31003F26F8A15e9B645803d85eA81).",
  sonic: {
    tvl: snakeGenesisTVL,
    pool2,
    staking,
  },
};