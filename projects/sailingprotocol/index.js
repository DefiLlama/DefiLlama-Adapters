const sdk = require('@defillama/sdk')

const SPY = '0x75B5DACEc8DACcb260eA47549aE882513A21CE01';
const ARKK = '0x2E4763AdBEe00D5eB3089ec25973599c0e62dD07';

async function tvl(_0, _1, _2, { api }) {
  const allTokenAddresses = [SPY, ARKK];
  for (const tokenAddress of allTokenAddresses) {
    const tokenTotalSupply = await api.call({ abi: 'erc20:totalSupply', target: tokenAddress });
    api.add(tokenAddress, tokenTotalSupply);
  }
}

module.exports = {
  misrepresentedTokens: false,
  timetravel: true,
  kava: { tvl, },
  methodology: 'The total supply of their circulating stocks is extracted from their stock token contracts.'
}
