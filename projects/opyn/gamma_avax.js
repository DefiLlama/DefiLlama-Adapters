const sdk = require('@defillama/sdk');

const marginPool = "0xCCF6629aEaB734E621Cc59EBb0297196774fDb9D";
const wavax = '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7'.toLowerCase()

module.exports.tvl = async function tvl(timestamp, block) {

  let balances = {};

  const wavaxBalance = (
    await sdk.api.abi.call({
      target: wavax,
      params: marginPool,
      abi: 'erc20:balanceOf',
      block,
      chain: 'avax'
    })
  );

  sdk.util.sumSingleBalance(balances, `avax:${wavax}`, wavaxBalance.output)

  return balances;
}