const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const { BigNumber } = require("bignumber.js");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const abi = require("./abi.json");

const translate = {
  "0xbfa9df9ed8805e657d0feab5d186c6a567752d7f":"0xcbfef8fdd706cde6f208460f2bf39aa9c785f05d",
  "0xa9c1740fa56e4c0f6ce5a792fd27095c8b6ccd87":"0xcbfef8fdd706cde6f208460f2bf39aa9c785f05d"
}

async function getUnitrollerTvl(block, chain, unitroller, cToken, cTokenEquivalent, kine, xKine, kMcd) {
  let balances = {};

  const allMarkets = (await sdk.api.abi.call({
    target: unitroller,
    abi: abi["getAllMarkets"],
    block,
    chain
  })).output;

  for (let i = allMarkets.length -1 ; i >= 0; i--) {
    let address = allMarkets[i].toLowerCase();
    if (address === cToken || address === kMcd) {
      allMarkets.splice(i, 1);
    }
  }

  const cTokenBalance = (await sdk.api.erc20.totalSupply({
    target: cToken,
    block,
    chain
  })).output;

  sdk.util.sumSingleBalance(balances, `${chain}:${cTokenEquivalent}`, cTokenBalance);

  const underlyings = (await sdk.api.abi.multiCall({
    calls: allMarkets.map(p => ({
      target: p
    })),
    abi: abi["underlying"],
    block,
    chain
  })).output;

  const underlyingBalances = (await sdk.api.abi.multiCall({
    calls: underlyings.map(p => ({
      target: p.output,
      params: p.input.target
    })),
    abi: "erc20:balanceOf",
    block,
    chain
  })).output;

  const symbols = (await sdk.api.abi.multiCall({
    calls: underlyings.map(p => ({
      target: p.input.target
    })),
    abi: "erc20:symbol",
    block,
    chain
  })).output;

  let lpPositions = [];

  for (let i = 0; i < underlyingBalances.length; i++) {
    let token = underlyingBalances[i].input.target.toLowerCase();
    let balance = underlyingBalances[i].output;
    let symbol = symbols[i].output;

    if (symbol.endsWith("LP")) {
      lpPositions.push({
        token,
        balance
      });
      continue;
    }

    if (token === xKine) {
      const totalSupply = (await sdk.api.erc20.totalSupply({
        target: xKine,
        block,
        chain
      })).output;
  
      const kineBal = (await sdk.api.erc20.balanceOf({
        target: kine,
        owner: xKine,
        block,
        chain
      })).output;
  
      const ratio = Number(kineBal) / Number(totalSupply);
      balance = BigNumber(balance).times(ratio).toFixed(0);
      token = kine;
    }

    if (translate[token] !== undefined) {
      sdk.util.sumSingleBalance(balances, translate[token], balance);
      continue;
    }
    sdk.util.sumSingleBalance(balances, `${chain}:${token}`, balance);
  }

  await unwrapUniswapLPs(balances, lpPositions, block, chain, addr=> {
    addr = addr.toLowerCase();
    if (translate[addr] !== undefined) {
      return translate[addr];
    }
    return `${chain}:${addr}`;
  });

  return balances;
}

async function getBorrowed(block, chain, kMcd) {
  let balances = {};

  const totalBorrows = (await sdk.api.abi.call({
    target: kMcd,
    abi: abi["totalBorrows"],
    block,
    chain
  })).output;

  sdk.util.sumSingleBalance(balances, ADDRESSES.ethereum.USDT, BigNumber(totalBorrows).div(1e12).toFixed(0));

  return balances;
}

const ethUnitroller = "0xbb7d94a423f4978545ecf73161f0678e8afd1a92";
const keth = "0xa58e822de1517aae7114714fb354ee853cd35780";
const weth = ADDRESSES.ethereum.WETH;
const ethXKine = "0xa8d7643324df0f38764f514eb1a99d8f379cc692";
const ethKine = "0xcbfef8fdd706cde6f208460f2bf39aa9c785f05d";
const ethkMcd = "0xaf2617aa6fd98581bb8cb099a16af74510b6555f";

async function ethTvl(timestamp, block) {
  return await getUnitrollerTvl(block, "ethereum", ethUnitroller, keth, weth, ethKine, ethXKine, ethkMcd);
}

async function ethBorrow(timestamp, block) {
  return await getBorrowed(block, "ethereum", ethkMcd);
}

const bscUnitroller = "0x3c2ddd486c07343b711a4415cdc9ab90ed32b571";
const kbnb = "0x5fbe4eb536dadbcee54d5b55ed6559e29c60b055";
const wbnb = ADDRESSES.bsc.WBNB;
const bscXKine = "0x8f5abd0d891d293b13f854700ff89210da3d5ba3";
const bscKine = "0xbfa9df9ed8805e657d0feab5d186c6a567752d7f";
const bsckMcd = "0x4f1ab95b798084e44d512b8b0fed3ef933177986";

async function bscTvl(timestamp, block, chainBlocks) {
  return await getUnitrollerTvl(chainBlocks.bsc, "bsc", bscUnitroller, kbnb, wbnb, bscKine, bscXKine, bsckMcd);
}

async function bscBorrowed(timestamp, block, chainBlocks) {
  return await getBorrowed(chainBlocks.bsc, "bsc", bsckMcd);
}

const polygonUnitroller = "0xdff18ac4146d67bf2ccbe98e7db1e4fa32b96881";
const kmatic = "0xf186a66c2bd0509beaafca2a16d6c39ba02425f9";
const wmatic = ADDRESSES.polygon.WMATIC_2;
const polygonXKine = "0x66a782c9a077f5adc988cc0b5fb1cdcc9d7adeda";
const polygonKine = "0xa9c1740fa56e4c0f6ce5a792fd27095c8b6ccd87";
const polygonkMcd = "0xcd6b46443becad4996a70ee3d8665c0b86a0c54c";

async function polygonTvl(timestamp, block, chainBlocks) {
  return await getUnitrollerTvl(chainBlocks.polygon, "polygon", polygonUnitroller, kmatic, wmatic, polygonKine, polygonXKine, polygonkMcd);
}

async function polygonBorrowed(timestamp, block, chainBlocks) {
  return await getBorrowed(chainBlocks.polygon, "polygon", polygonkMcd);
}

const avaxUnitroller = "0x0ec3126390c606be63a0fa6585e68075f06679c6";
const kavax = "0x0544be6693763d64c02f49f16986ba1390a2fc39";
const wavax = ADDRESSES.avax.WAVAX;
const avaxXKine = "0x68b9737ae74cf1a169890042f1aa359647aa3e47";
const avaxKine = "0xa9c1740fa56e4c0f6ce5a792fd27095c8b6ccd87";
const avaxkMcd = "0xcd6b46443becad4996a70ee3d8665c0b86a0c54c";

async function avaxTvl(timestamp, block, chainBlocks) {
  return await getUnitrollerTvl(chainBlocks.avax, "avax", avaxUnitroller, kavax, wavax, avaxKine, avaxXKine, avaxkMcd);
}

async function avaxBorrowed(timestamp, block, chainBlocks) {
  return await getBorrowed(chainBlocks.avax, "avax", avaxkMcd);
}

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    tvl: ethTvl,
    borrowed: ethBorrow
  },
  bsc: {
    tvl: bscTvl,
    borrowed: bscBorrowed
  },
  polygon: {
    tvl: polygonTvl,
    borrowed: polygonBorrowed
  },
  avax:{
    tvl: avaxTvl,
    borrowed: avaxBorrowed
  }
}