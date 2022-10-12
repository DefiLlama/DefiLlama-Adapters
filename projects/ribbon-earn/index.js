const sdk = require("@defillama/sdk")
const abi = require("../ribbon/abi.json")

// Ribbon Earn vaults
const rearnUSDC = "0x84c2b16FA6877a8fF4F3271db7ea837233DFd6f0";

// Ethereum Assets
const usdc = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
async function addVaults({ balances, chain, vaults, block, transformAddress = a => a }) {
  const { output: balanceRes } = await sdk.api.abi.multiCall({
    abi: abi.totalBalance,
    calls: vaults.map(i => ({ target: i[1]})),
    chain, block,
  })

  balanceRes.forEach((data, i) => sdk.util.sumSingleBalance(balances, transformAddress(vaults[i][0]), data.output))
}

async function tvl(_, block) {
  const balances = {};
  const vaults = [
    // ribbon earn
    [usdc, rearnUSDC],
  ]
  
  await addVaults({ balances, block, vaults, })
  return balances
}

module.exports = {
  ethereum: {
    tvl,
  },
}
