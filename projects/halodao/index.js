const sdk = require("@defillama/sdk");
const { staking } = require("../helper/staking.js");

const rnbwEthToken = "0xe94b97b6b43639e238c851a7e693f50033efd75c";
const rnbwEthPool = "0x47BE779De87de6580d0548cde80710a93c502405";

// Nothing in RNBW staking pool on polygon yet
const wrnbwPolyToken = "0x18e7bDB379928A651f093ef1bC328889b33A560c";
const wrnbwPolyPool = "0xc104e54803abA12f7a171a49DDC333Da39f47193";

// ETH Pool 2 pool RNBW-ETH
const rnbwUniPool = {
  lpToken: "0x3E8E036Ddfd310B0838d3CC881A9fa827778845D",
  token0: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
  token1: "0xe94b97b6b43639e238c851a7e693f50033efd75c",
};

const ethPools = [
  {
    // USDC:XSGD
    lpToken: "0x64DCbDeb83e39f152B7Faf83E5E5673faCA0D42A",
    token0: "0x70e8de73ce538da2beed35d14187f6959a8eca96",
    token1: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  },
  {
    // USDC:TCAD
    lpToken: "0xE15E50fF9d52beC41D53d3173F2ed40834D455f4",
    token0: "0x00000100F2A2bd000715001920eB70D229700085",
    token1: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  },
  {
    // USDC:TAUD
    lpToken: "0x11816335DEe6763e2A7B6080b2b2980Eac7F85E4",
    token0: "0x00006100F7090010005F1bd7aE6122c3C2CF0090",
    token1: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  },
  {
    // USDC:TGBP
    lpToken: "0x2ED09E2961D72659E4002ba8C2BaDfedC7db19B7",
    token0: "0x00000000441378008ea67f4284a57932b1c000a5",
    token1: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  },
];

const polyPools = [
  {
    //xSGD:USDC
    lpToken: "0x8123C64D6607412C7Ac9E880f12245ef22558b14",
    token0: "0x769434dca303597c8fc4997bf3dab233e961eda2",
    token1: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
  },
  {
    //wTCAD:USDC
    lpToken: "0xaEad273bc7E17DD6951ceD3264B1dBa8A19114C2",
    token0: "0x6d3cC56DFC016151eE2613BdDe0e03Af9ba885CC",
    token1: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
  },
  {
    //wTAUD:USDC
    lpToken: "0x95AB308bE1e209eB6FfdD3279B5ea71D365AD30B",
    token0: "0xe4F7761b541668f88d04fe9F2E9DF10CA613aEf7",
    token1: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
  },
  {
    //wTGBP:USDC
    lpToken: "0xbF772a745533f6bAd97C58D2cb6B241eF7487242",
    token0: "0x81A123f10C78216d32F8655eb1A88B5E9A3e9f2F",
    token1: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
  },
];

//Converts Polygon tokens to ETH tokens cause CoinGecko
const tokenConvert = {
  "0x2791bca1f2de4661ed88a30c99a7a9449aa84174":
    "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // USDC
  "0x769434dca303597c8fc4997bf3dab233e961eda2":
    "0x70e8de73ce538da2beed35d14187f6959a8eca96", // xSGD
  "0x6d3cC56DFC016151eE2613BdDe0e03Af9ba885CC":
    "0x00000100F2A2bd000715001920eB70D229700085", // wTCAD
  "0xe4F7761b541668f88d04fe9F2E9DF10CA613aEf7":
    "0x00006100F7090010005F1bd7aE6122c3C2CF0090", // wTAUD
  "0x81A123f10C78216d32F8655eb1A88B5E9A3e9f2F":
    "0x00000000441378008ea67f4284a57932b1c000a5", // wTGBP
};

async function calcTvl(balances, pools, block, chain) {
  for (let i = 0; i < pools.length; i++) {
    let { output: balance } = await sdk.api.abi.multiCall({
      calls: [
        {
          target: pools[i].token0,
          params: pools[i].lpToken,
        },
        {
          target: pools[i].token1,
          params: pools[i].lpToken,
        },
      ],
      abi: "erc20:balanceOf",
      block: block,
      chain: chain,
    });
    let tokens = [pools[i].token0, pools[i].token1];
    for (let j = 0; j < tokens.length; j++) {
      if (tokens[j] in tokenConvert) {
        tokens[j] = tokenConvert[tokens[j]];
      }
    }

    sdk.util.sumSingleBalance(balances, tokens[0], balance[0].output);
    sdk.util.sumSingleBalance(balances, tokens[1], balance[1].output);
  }
}

async function ethTvl(timestamp, block) {
  let balances = {};
  await calcTvl(balances, ethPools, block, "ethereum");
  return balances;
}

async function ethPool2(timestamp, block) {
  let balances = {};
  await calcTvl(balances, [rnbwUniPool], block, "ethereum");
  return balances;
}

async function polygonTvl(timestamp, block, chainBlocks) {
  let balances = {};
  await calcTvl(balances, polyPools, chainBlocks.polygon, "polygon");
  return balances;
}

module.exports = {
  ethereum: {
    tvl: ethTvl,
    staking: staking(rnbwEthPool, rnbwEthToken),
    pool2: ethPool2,
  },
  polygon: {
    tvl: polygonTvl,
    staking: staking(wrnbwPolyPool, wrnbwPolyToken, "polygon"),
  },
  tvl: sdk.util.sumChainTvls([ethTvl, polygonTvl]),
};
