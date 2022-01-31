const sdk = require("@defillama/sdk");
const abi = require("../sperax/abi.json");
const BigNumber = require("bignumber.js");

const vaultcore = '0xF783DD830A4650D2A8594423F123250652340E3f'
const collateralTokens = [
  '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8', // USDC
  '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9', // USDT 
]
const strategyArr = [
  '0xbF82a3212e13b2d407D10f5107b5C8404dE7F403', // Strategy （TwoPoolStrategy） for USDC
  '0xdc118F2F00812326Fe0De5c9c74c1c0c609d1eB4', // Strategy （TwoPoolStrategy） for USDT
]

const SPA = '0x5575552988a3a80504bbaeb1311674fcfd40ad4b'

async function tvl (timestamp, ethBlock, chainBlocks) {
  const chain = 'arbitrum'
  const block = chainBlocks[chain]

  const allstrategyBalance = (
    await sdk.api.abi.multiCall({
      abi: abi.checkBalance,
      calls: strategyArr.map((item, index) => ({
        target: item,
        params: [collateralTokens[index]],
      })),
      chain,
      block,
    })
  ).output.map((o) => o.output);

  const collateralBalances = (await sdk.api.abi.multiCall({
      abi: "erc20:balanceOf",
      calls: collateralTokens.map((t) => ({
        target: t,
        params: [vaultcore],
      })),
      chain,
      block,
    })
  ).output.map((o) => o.output);

  const balances = {};
  function getBalance (balances) {
    for(let i =0; i < collateralTokens.length; i++) {
      sdk.util.sumSingleBalance(balances, `arbitrum:${collateralTokens[i]}`, (BigNumber(collateralBalances[i]).plus(BigNumber(allstrategyBalance[i]))).toFixed(0))
    }
  }
  getBalance(balances)
  console.log(balances)
  return balances
}

module.exports = {
  arbitrum: {
    tvl
  },
  methodology: 'Counts as TVL all collateral - USDC, USDT at the moment - provided as collateral along SPA to mint USDs, stored in the vaultcore contract.'
}