const sdk = require("@defillama/sdk");

async function lpRevShareLtv() {
  const balances = {};
  const poolV2 = '0x152E2502c22F73a7493df8B856836efBc69E3718';
  const lpRevShare = '0x5F51A04c271C395994F156172cDe451a0188Ca75';

  const { output: tokens } = await sdk.api.erc20.balanceOf({
    target: poolV2,
    owner: lpRevShare,
    chain: 'ethereum',
  });

  sdk.util.sumSingleBalance(balances, poolV2, tokens, 'ethereum');

  return balances;
}

module.exports = {
  lpRevShareLtv,
};
