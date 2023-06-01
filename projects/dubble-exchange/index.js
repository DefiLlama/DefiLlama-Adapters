const sdk = require('@defillama/sdk');
const { transformArbitrumAddress } = require('../helper/portedTokens');
const VAULT_CONTRACT = "0xD522395dfD017F47a932D788eC7CB058aDBbc783";
const USDC = "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8"

async function tvl(timestamp, block, chainBlocks){
  const balances = {};
  const transform = await transformArbitrumAddress();

  const collateralBalance = (await sdk.api.abi.call({
    abi: "uint256:checkBalance",
    chain: 'arbitrum',
    target: VAULT_CONTRACT,
    block: chainBlocks['arbitrum'],
  })).output;

  sdk.util.sumSingleBalance(balances, transform(USDC), collateralBalance);
  return balances;
}

module.exports = {
  arbitrum: {
    tvl
  }
};
