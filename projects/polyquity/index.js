const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");

const MATIC_ADDRESS = ADDRESSES.ethereum.MATIC;
const MATIC_TROVE_MANAGER_ADDRESS = "0xA2A065DBCBAE680DF2E6bfB7E5E41F1f1710e63b";

const USDC_ADDRESS = ADDRESSES.ethereum.USDC;
const USDC_TROVE_MANAGER_ADDRESS = "0x09273531f634391dE6be7e63C819F4ccC086F41c";

async function tvl(_, _ethBlock, chainBlocks) {
  const MaticBalance = (
    await sdk.api.abi.call({
      target: MATIC_TROVE_MANAGER_ADDRESS,
      abi: "uint256:getEntireSystemColl",
      block: chainBlocks['polygon'],
      chain: 'polygon'
    })
  ).output;

  const USDCBalance = (
    await sdk.api.abi.call({
      target: USDC_TROVE_MANAGER_ADDRESS,
      abi: "uint256:getEntireSystemColl",
      block: chainBlocks['polygon'],
      chain: 'polygon'
    })
  ).output;

  return { [MATIC_ADDRESS]: MaticBalance, [USDC_ADDRESS]: USDCBalance};
}

module.exports = {
  polygon: { tvl },
};
