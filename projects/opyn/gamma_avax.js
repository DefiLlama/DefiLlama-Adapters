const sdk = require('@defillama/sdk');

const START_BLOCK = 7339816;
const marginPool = "0xCCF6629aEaB734E621Cc59EBb0297196774fDb9D".toLowerCase();
const wavax = 'avax:0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7'.toLowerCase();

module.exports.tvl = async function tvl(timestamp, block) {

  let balances = {};

  if (block >= START_BLOCK) {

    const wavaxBalance = (
      await sdk.api.abi.call({
        target: wavax,
        params: marginPool,
        abi: 'erc20:balanceOf',
        block
      })
    ).output;
    sdk.util.sumSingleBalance(balances, wavax, wavaxBalance)

  }

  return balances;
}