const { stakings } = require("../helper/staking");
const sdk = require("@defillama/sdk");

const stakingContract = [
  "0xc947FA28527A06cEE53614E1b77620C1b7D3A75D",
  "0xCa0F390C044FD43b1F38B9D2A02e06b13B65FA48",
];

const ETHTOKENS = {
  OVR: "0x21bfbda47a0b4b5b1248c767ee49f7caa9b23697",
  MATIC: "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0",
  BNB: "0xB8c77482e45F1F44dE1745F52C74426C631bDD52",
};

const OVR = {
  eth: "0x21bfbda47a0b4b5b1248c767ee49f7caa9b23697",
  bsc: "0x7E35D0e9180bF3A1fc47b0d110bE7a21A10B41Fe",
  polygon: "0x1631244689EC1fEcbDD22fb5916E920dFC9b8D30",
};

const pools = {
  eth: [
    "0x0B0d6c11d26B58cB25F59bD9B14190C8941e58fc",
    "0xc3f6B81FB9e6DB259272026601689e383f94c0B0",
  ],
  bsc: ["0xa73df2423ff3a165d89024729ec5a62f821831d1"],
  polygon: ["0xBEb89416FE362d975Fe98099Bc463D475ef4CEc4"],
};

const DAI = "0x6b175474e89094c44da98b954eedeac495271d0f";
const WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
const WBNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
const WMATIC = "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270";
const IBCO = "0x8c19cF0135852BA688643F57d56Be72bB898c411";

const ethTVL = async () => {
  const ibcoDaiBalance = (
    await sdk.api.erc20.balanceOf({
      target: DAI,
      owner: IBCO,
      chain: "ethereum",
    })
  ).output;
  const ovrBalance = (
    await sdk.api.abi.multiCall({
      abi: "erc20:balanceOf",
      calls: stakingContract.map((address) => ({
        target: OVR.eth,
        params: address,
      })),
      chain: "ethereum",
    })
  ).output.reduce((a, b) => Number(a) + Number(b.output), 0);

  const ethPoolOVR = (
    await sdk.api.abi.multiCall({
      abi: "erc20:balanceOf",
      calls: pools.eth.map((address) => ({
        target: OVR.eth,
        params: address,
      })),
      chain: "ethereum",
    })
  ).output.reduce((a, b) => Number(a) + Number(b.output), 0);

  const ethPoolWETH = (
    await sdk.api.abi.multiCall({
      abi: "erc20:balanceOf",
      calls: pools.eth.map((address) => ({
        target: WETH,
        params: address,
      })),
      chain: "ethereum",
    })
  ).output.reduce((a, b) => Number(a) + Number(b.output), 0);

  return {
    [DAI]: ibcoDaiBalance,
    [ETHTOKENS.OVR]: Number(ovrBalance) + Number(ethPoolOVR),
    [WETH]: ethPoolWETH,
  };
};

const bscTVL = async () => {
  const bscPoolOVR = (
    await sdk.api.abi.multiCall({
      abi: "erc20:balanceOf",
      calls: pools.bsc.map((address) => ({
        target: OVR.bsc,
        params: address,
      })),
      chain: "bsc",
    })
  ).output.reduce((a, b) => Number(a) + Number(b.output), 0);

  const bscPoolWBNB = (
    await sdk.api.abi.multiCall({
      abi: "erc20:balanceOf",
      calls: pools.bsc.map((address) => ({
        target: WBNB,
        params: address,
      })),
      chain: "bsc",
    })
  ).output.reduce((a, b) => Number(a) + Number(b.output), 0);

  return {
    [ETHTOKENS.BNB]: bscPoolWBNB,
    [ETHTOKENS.OVR]: bscPoolOVR,
  };
};

const polygonTVL = async (time, ethBlock, chainBlocks) => {
  const polygonPoolOVR = (
    await sdk.api.abi.multiCall({
      abi: "erc20:balanceOf",
      calls: pools.polygon.map((address) => ({
        target: OVR.polygon,
        params: address,
      })),
      chain: "polygon",
    })
  ).output.reduce((a, b) => Number(a) + Number(b.output), 0);

  const polygonPoolWMATIC = (
    await sdk.api.abi.multiCall({
      abi: "erc20:balanceOf",
      calls: pools.polygon.map((address) => ({
        target: WMATIC,
        params: address,
      })),
      chain: "polygon",
    })
  ).output.reduce((a, b) => Number(a) + Number(b.output), 0);

  return {
    [ETHTOKENS.MATIC]: polygonPoolWMATIC,
    [ETHTOKENS.OVR]: polygonPoolOVR,
  };
};

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    tvl: ethTVL,
    staking: stakings(stakingContract, OVR.eth, "ethereum"),
  },
  bsc: {
    tvl: bscTVL,
  },
  polygon: {
    tvl: polygonTVL,
  },
  methodology:
    "We count the tokens locked in the staking contract, the tokens in the pools and the tokens in the IBCO reserve.",
};
