const { sumTokens2 } = require("../helper/unwrapLPs");
const { staking } = require("../helper/staking");

const gsnakeTokenAddress = "0x674a430f531847a6f8976A900f8ace765f896a1b";
const snakeGenesisAddress = '0x29D0762f7bE8409d0aC34A3595AF62E8c0120950'
const gsnakeRewardPoolAddress = "0xFE6915a0983a304F4D131DA635664030dA06Bcd2";
const masonryAddress = "0x54eb20859334C1958eb67f1b5a283b7A100280D3";

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


const pool2 = async (api) => {
  let gauges = await api.call({ abi: 'address[]:getAllGauges', target: '0x3af1dd7a2755201f8e2d6dcda1a61d9f54838f4f' })
  let pools = await api.multiCall({ abi: 'address:stake', calls: gauges, permitFailure: true })
  const pools2 = []
  const gauges2 = []
  pools.forEach((pool, i) => {
    if (!pool) return;
    pools2.push(pool)
    gauges2.push(gauges[i])
  })
  const bals = await api.multiCall({ abi: 'erc20:balanceOf', calls: gauges2.map(gauge => ({ target: gauge, params: gsnakeRewardPoolAddress })) })
  api.add(pools2, bals)
  return sumTokens2({ api, tokens: pools2, })
};


module.exports = {
  methodology: "Pool2 deposits consist of SNAKE/S and GSNAKE/S LP tokens deposits while the staking TVL consists of the GSNAKEs tokens locked within the Masonry contract(0x5A5d34826ab31003F26F8A15e9B645803d85eA81).",
  hallmarks: [
    [1739577600, 'Genesis Phase Ended']
  ],
  sonic: {
    tvl: snakeGenesisTVL,
    pool2,
    staking: staking(masonryAddress, gsnakeTokenAddress),
  },
};