const sdk = require('@defillama/sdk');
const { getChainTransform } = require('../helper/portedTokens')
const ALP_TOKEN = '0xb49B6A3Fd1F4bB510Ef776de7A88A9e65904478A';

const chain = 'arbitrum'


async function tvl(_, _b, { [chain]: block}) {
  const balances = {};
  const transform = await getChainTransform(chain);

  const collateralBalance = (await sdk.api.abi.call({
    abi: 'erc20:totalSupply',
    chain,
    target: ALP_TOKEN,
    block,
  })).output;

  sdk.util.sumSingleBalance(balances, transform(ALP_TOKEN), collateralBalance)

  return balances;
}

module.exports = {
  arbitrum: {
    tvl,
  }
}; // node test.js projects/arbitrove/index.js