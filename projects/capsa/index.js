const sdk = require('@defillama/sdk');
const BigNumber = require("bignumber.js");
const { toUSDTBalances } = require('../helper/balances');
const CAPSA_TOKEN = "0x0db7bc3a99e0794befc8cdce68232a90df4a313b";
const SWAP_ADDRESS = "0xef794b989190a0667a6bf25bd603422f659a9aaa";

const totalSupplyAbi = {"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"};
const getPriceAbi = {"inputs":[],"name":"getPrice","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"};

async function tvl(timestamp, block, chainBlocks) {
  const totalSupplyCall = await sdk.api.abi.call({
    chain: 'polygon',
    target: CAPSA_TOKEN,
    abi: totalSupplyAbi,
    block: chainBlocks['polygon'],
  });

  const totalSupply = new BigNumber(totalSupplyCall.output) / 1e6;
  const capsaPriceCall = await sdk.api.abi.call({
    chain: 'polygon',
    target: SWAP_ADDRESS,
    abi: getPriceAbi,
    block: chainBlocks['polygon'],
  });
  const capsaPrice = capsaPriceCall.output / 1e6;
  return toUSDTBalances(totalSupply * capsaPrice);
}

module.exports = {
  misrepresentedTokens: true,
  methodology: "Grow your portfolio with our long-term stablecoin yield.",
  polygon: {
    tvl
  },
};
