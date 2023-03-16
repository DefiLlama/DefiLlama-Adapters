const sdk = require("@defillama/sdk")
const abi = require("../ribbon/abi.json")
const { sumTokensExport } = require('../helper/unwrapLPs');
const { default: BigNumber } = require("bignumber.js");

// Ribbon Earn vaults
const rearnUSDC = "0x84c2b16FA6877a8fF4F3271db7ea837233DFd6f0";
const rearnstETH = "0xCE5513474E077F5336cf1B33c1347FDD8D48aE8c";

// Ethereum Assets
const usdc = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const steth = "0xae7ab96520de3a18e5e111b5eaab095312d7fe84";

async function addVaults({ balances, chain, vaults, block, transformAddress = a => a }) {
  const { output: balanceRes } = await sdk.api.abi.multiCall({
    abi: abi.totalBalance,
    calls: vaults.map(i => ({ target: i[1]})),
    chain, block,
  })

  balanceRes.forEach((data, i) => sdk.util.sumSingleBalance(balances, transformAddress(vaults[i][0]), data.output))
}

async function getAssetOnVault(asset, param, block) {
  const { output: balance } = await sdk.api.abi.call({
    target: asset, abi: 'erc20:balanceOf', params: param, block,
  })
  return balance
}

async function borrowed(_, block) {
  const balances = {};
  const vaults = [
    // ribbon earn
    [usdc, rearnUSDC],
    [steth, rearnstETH],
  ]
  await addVaults({ balances, block, vaults, })
  sdk.util.sumSingleBalance(balances, usdc, BigNumber(-1 * (await getAssetOnVault(usdc, rearnUSDC, block))).toFixed(0))
  sdk.util.sumSingleBalance(balances, steth, BigNumber(-1 * (await getAssetOnVault(steth, rearnstETH, block))).toFixed(0))
  return balances
}

module.exports = {
  ethereum: {
    tvl: sumTokensExport({tokensAndOwners: [[usdc, rearnUSDC], [steth, rearnstETH]]}),
    borrowed,
  },
}
