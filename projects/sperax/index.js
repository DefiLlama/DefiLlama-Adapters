const sdk = require("@defillama/sdk");

const vaultcore = '0xF783DD830A4650D2A8594423F123250652340E3f'
const collateralTokens = [
  '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8', // usdc
  '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9', // usdt 
]
// const spa = '' 

async function tvl (timestamp, ethBlock, chainBlocks) {
  const chain = 'arbitrum'
  const block = chainBlocks[chain]

  const collateralBalances = await sdk.api.abi.multiCall({
    abi: "erc20:balanceOf",
    calls: collateralTokens.map((t) => ({
        target: t,
        params: [vaultcore],
      })),
    chain,
    block,
  });

  const balances = {};
  sdk.util.sumMultiBalanceOf(balances, collateralBalances, true, t=>`arbitrum:${t}`);
  return balances
}

module.exports = {
  arbitrum: {
    tvl
  },
  methodology: 'Counts as TVL all collateral - USDC, USDT at the moment - provided as collateral along SPA to mint USDs, stored in the vaultcore contract.'
}