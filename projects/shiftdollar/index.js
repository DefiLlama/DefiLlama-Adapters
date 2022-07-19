
const sdk = require("@defillama/sdk");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { stakingUnknownPricedLP, stakingPricedLP } = require("../helper/staking");

const SHIFT = "0x4f9bd6be8455ee2b3c7ff76bbb885e6654797137";
const SFSHARE = "0xE64fF204Df5f3D03447dA4895C6DA1fB590F1290";
const boardroom = "0x251672021bE4Cbf8eD5a6Acb66478a29c95c7Cb5";
const rewardPool = "0x585ab630996dB20F7aCc0dbC48e7c332620E7D59";
const USDC = "0xc21223249CA28397B4B6541dfFaEcC539BfF0c59"
const factory = "0x9fB58aBA4a3aD49d273b42cb8F495C58e9a8d14F"
const lps = [
  "0xCbEA9C785D0D6233d3F965baC901ea42A7a3B05c",
  "0x69D31656669d798112D910A81ED39A9914Eabb8A",
];

const shareLps = "0xCbEA9C785D0D6233d3F965baC901ea42A7a3B05c";

async function calcPool2(block, chain) {
    //reward earn sDINO
  let balances = {};
  const lpBalances = (
    await sdk.api.abi.multiCall({
      calls: lps.map((p) => ({
        target: p,
        params: rewardPool,
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

async function pool2(timestamp, block, chainBlocks) {
  return await calcPool2(chainBlocks.cronos, "cronos");
}
async function tvl(timestamp, block, chainBlocks) {
    //tvl in mint contract
  let balances = {};

    const tokenBalance  = (
        await sdk.api.abi.call({
          target: USDC,
          abi: 'erc20:balanceOf',
          params: [factory],
          block: block,
          chain: 'cronos'
        })
      ).output;
      await sdk.util.sumSingleBalance(balances, "cronos:"+USDC, tokenBalance)
   
  return balances;
}
module.exports = {
  cronos: {
    tvl: tvl,
    pool2: pool2,
    staking: stakingPricedLP(boardroom, SFSHARE, "cronos", shareLps, "usd-coin", null, 6)
  }
}; // node test.js projects/shiftdollar.js
