const sdk = require("@defillama/sdk");
const getEntireSystemCollAbi = require("./getEntireSystemColl.abi.json")

const MATIC_ADDRESS = '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0';
const MATIC_TROVE_MANAGER_ADDRESS = "0xA2A065DBCBAE680DF2E6bfB7E5E41F1f1710e63b";

const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
const USDC_TROVE_MANAGER_ADDRESS = "0x09273531f634391dE6be7e63C819F4ccC086F41c";

async function tvl(_, _ethBlock, chainBlocks) {
  const MaticBalance = (
    await sdk.api.abi.call({
      target: MATIC_TROVE_MANAGER_ADDRESS,
      abi: getEntireSystemCollAbi,
      block: chainBlocks['polygon'],
      chain: 'polygon'
    })
  ).output;

  const USDCBalance = (
    await sdk.api.abi.call({
      target: USDC_TROVE_MANAGER_ADDRESS,
      abi: getEntireSystemCollAbi,
      block: chainBlocks['polygon'],
      chain: 'polygon'
    })
  ).output;

  return { [MATIC_ADDRESS]: MaticBalance, [USDC_ADDRESS]: USDCBalance};
}

module.exports = {
  tvl,
};
