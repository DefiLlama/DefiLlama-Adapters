const sdk = require("@defillama/sdk");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { staking, stakingPricedLP } = require("../helper/staking");

const pdoTokenAddress = "0xb9D62c829fbF7eAff1EbA4E50F3D0480b66c1748";
const spdoTokenAddress = "0x1D3918043d22de2D799a4d80f72Efd50Db90B5Af";
const spdoRewardPoolAddress = "0xe8E0f521433028718baa338467151A3D43974292";
const boardroomAddress = "0x82D868D99747fbF9FDff367Bb9f1c55112B05c7F";
const treasuryAddress = "0x25231b57030e795e1A12E10315cD9b779E395AaD";

const ftmLPs = [
  "0xd339d12C6096Cb8E16a2BcCB5ACacA362bE78EA7", // pdoDaiLpAddress
  "0x5FBbd691e7d998fe6D5059B9BFa841223c018c31", // spdoDaiLpAddress
];

async function calcPool2(masterchef, lps, block, chain) {
  let balances = {};
  const lpBalances = (
    await sdk.api.abi.multiCall({
      calls: lps.map((p) => ({
        target: p,
        params: masterchef,
      })),
      abi: "erc20:balanceOf",
      block,
      chain,
    })
  ).output;
  let lpPositions = [];
  lpBalances.forEach((p) => {
    lpPositions.push({
      balance: p.output,
      token: p.input.target,
    });
  });
  await unwrapUniswapLPs(
    balances,
    lpPositions,
    block,
    chain,
    (addr) => `${chain}:${addr}`
  );
  return balances;
}

async function ftmPool2(timestamp, block, chainBlocks) {
  return await calcPool2(spdoRewardPoolAddress, ftmLPs, chainBlocks.fantom, "fantom");
}

async function treasury(timestamp, block, chainBlocks) {
  let balance = (await sdk.api.erc20.balanceOf({
    target: pdoTokenAddress,
    owner: treasuryAddress, 
    block: chainBlocks.fantom,
    chain: 'fantom'
  })).output;

  return { [`fantom:${pdoTokenAddress}`] : balance }
}
module.exports = {
  methodology: "Pool2 deposits consist of PDO/DAI and sPDO/DAI LP tokens deposits while the staking TVL consists of the sPDO tokens locked within the Boardroom contract(0x82D868D99747fbF9FDff367Bb9f1c55112B05c7F).",
  fantom: {
    tvl: async () => ({}),
    pool2: ftmPool2,
    staking: stakingPricedLP(boardroomAddress, spdoTokenAddress, "fantom", "0x5FBbd691e7d998fe6D5059B9BFa841223c018c31", "fantom"),
    treasury
  },
};