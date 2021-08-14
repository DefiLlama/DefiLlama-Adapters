const sdk = require('@defillama/sdk');
const abi = require('./abi');

const BNB_ADDRESS = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
const PUSD_TOKEN_ADDRESS = "0xedbdb5c2f68ece62ef35134a22156e665c3b06e3";
const prefixBsc = addr => `bsc:${addr}`;

// StabilityPool holds deposited PUSD
const STABILITY_POOL_ADDRESS = "0xD4F3B638dFe1509DD06B9c8Fcf45a4C87179f03F";

// TroveManager holds total system collateral (deposited BNB)
const TROVE_MANAGER_ADDRESS = "0xb283466d09177c5C6507785d600caFDFa538C65C";

async function bsc(timestamp, ethBlock, chainBlocks) {
  const stabilityPoolPusdTvl = (
    await sdk.api.erc20.balanceOf({
      target: PUSD_TOKEN_ADDRESS,
      owner: STABILITY_POOL_ADDRESS,
      block: chainBlocks['bsc'],
      chain: 'bsc',
    })
  ).output;

  const troveBnbTvl = (
    await sdk.api.abi.call({
      target: TROVE_MANAGER_ADDRESS,
      abi,
      block: chainBlocks['bsc'],
      chain: 'bsc',
    })
  ).output;

  return {
    [prefixBsc(BNB_ADDRESS)]: troveBnbTvl,
    [prefixBsc(PUSD_TOKEN_ADDRESS)]: stabilityPoolPusdTvl,
  };
}

module.exports = {
  name: "Piggy",
  token: "PUSD",
  category: "minting",
  start: 1623145388,
  bsc: {
    tvl: bsc
  },
  tvl: sdk.util.sumChainTvls([bsc]),
};
