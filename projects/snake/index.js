const { sumTokens2 } = require("../helper/unwrapLPs");
const { staking } = require("../helper/staking");
const sdk = require("@defillama/sdk");
const { sumTokensExport, sumUnknownTokens } = require("../helper/unknownTokens");


const gsnakeTokenAddress = "0x674a430f531847a6f8976A900f8ace765f896a1b";
const snakeGenesisAddress = '0x29D0762f7bE8409d0aC34A3595AF62E8c0120950'
const gsnakeRewardPoolAddress = "0xFE6915a0983a304F4D131DA635664030dA06Bcd2";
const masonryAddress = "0x54eb20859334C1958eb67f1b5a283b7A100280D3";

const ftmLPs = [
  "0x287c6882dE298665977787e268f3dba052A6e251", // snake-s-lp
  "0xb901D7316447C84f4417b8a8268E2822095051E6", // gsnake-s-lp
];


async function snakeGenesisTVL(api) {
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

  return sumTokens2({ api, tokens, owner: snakeGenesisAddress, })
}


const tvl = async (api) => {
  const balances = {}

  const [
    snakeLpBal, // snake-s
    gsnakeLpBal, // gsnake-s
    shadowLpBal, // shadow-s
    mclbLpBal, // mclb-s
    shedewLpBal // shadow-shedew
  ] = await api.multiCall({
    calls: [
      { target: "0x28c6d651A9592CE61fdba8fffEFFcD0d33023B8A", params: "0xFE6915a0983a304F4D131DA635664030dA06Bcd2", },
      { target: "0xfc9E8be44d148242075dcCdbA42b81C7A8DF9E06", params: "0xFE6915a0983a304F4D131DA635664030dA06Bcd2", },
      { target: "0xCBcAd939E2bbbe01850A141F204f25DF63b8FC5B", params: "0xFE6915a0983a304F4D131DA635664030dA06Bcd2", },
      { target: "0x924f905B084252ACAD9E8AA5746531ae54698439", params: "0xFE6915a0983a304F4D131DA635664030dA06Bcd2", },
      { target: "0x8279C4F93C385C7DA440b6140Ec2811664BeB832", params: "0xFE6915a0983a304F4D131DA635664030dA06Bcd2", },
    ],
    abi: "erc20:balanceOf",
  });

  sdk.util.sumSingleBalance(balances, "0x287c6882dE298665977787e268f3dba052A6e251", snakeLpBal)
  sdk.util.sumSingleBalance(balances, "0xb901D7316447C84f4417b8a8268E2822095051E6", gsnakeLpBal)
  sdk.util.sumSingleBalance(balances, "0xF19748a0E269c6965a84f8C98ca8C47A064D4dd0", shadowLpBal)
  sdk.util.sumSingleBalance(balances, "0xDE87419F0774eef80b0EbD134Ff54ece0d4927C9", mclbLpBal)
  sdk.util.sumSingleBalance(balances, "0x880ADDfEB13bb647a2dc5fC01f5ADCbB6Baa401F", shedewLpBal)

  api.add('0x287c6882dE298665977787e268f3dba052A6e251', snakeLpBal)
  api.add('0xb901D7316447C84f4417b8a8268E2822095051E6', gsnakeLpBal)
  api.add('0xF19748a0E269c6965a84f8C98ca8C47A064D4dd0', shadowLpBal)
  api.add('0xDE87419F0774eef80b0EbD134Ff54ece0d4927C9', mclbLpBal)
  api.add('0x880ADDfEB13bb647a2dc5fC01f5ADCbB6Baa401F', shedewLpBal)

  return sumUnknownTokens({  useDefaultCoreAssets: true, api, resolveLP: true,  });
};


module.exports = {
  methodology: "Pool2 deposits consist of SNAKE/S and GSNAKE/S LP tokens deposits while the staking TVL consists of the GSNAKEs tokens locked within the Masonry contract(0x5A5d34826ab31003F26F8A15e9B645803d85eA81).",
  sonic: {
    tvl: sdk.util.sumChainTvls([
      snakeGenesisTVL,
      tvl,
      staking(masonryAddress, gsnakeTokenAddress),
    ]),
    pool2: tvl,
    staking: staking(masonryAddress, gsnakeTokenAddress),
  },
};