const sdk = require("@defillama/sdk");
const { get } = require("../helper/http");
const BigNumber = require("bignumber.js");
const { unwrapBalancerPool } = require('../helper/unwrapLPs')

const addresses = {
  aura: "0xc0c293ce456ff0ed870add98a0828dd4d2903dbf",
  auraLocker: "0x3Fa73f1E5d8A792C80F426fc8F84FBF7Ce9bBCAC",
  bal: "0xba100000625a3754423978a60c9317c58a424e3d",
  veBal: "0xC128a9954e6c874eA3d62ce62B468bA073093F25",
  auraDelegate: "0xaF52695E1bB01A16D33D7194C28C42b10e0Dbec2",
  bal80eth20: "0x5c6Ee304399DBdB9C8Ef030aB642B10820DB8F56",
};

async function tvl(_, block) {
  const { balancer: { tvl } } = await get("https://aura-metrics.onrender.com/tvl")
  const { output: veBalTotalSupply } = await sdk.api.erc20.totalSupply({ target: addresses.veBal, block })
  const { output: veBalance } = await sdk.api.erc20.balanceOf({ target: addresses.veBal, owner: addresses.auraDelegate, block })
  const ratio = veBalance / veBalTotalSupply
  const bal = await unwrapBalancerPool({ block, balancerPool: addresses.bal80eth20, owner: addresses.veBal, })
  const balances = {
    tether: tvl,
  }

  Object.entries(bal).forEach(([token, value], i) => {
    const newValue = BigNumber(+value * ratio).toFixed(0)
    sdk.util.sumSingleBalance(balances, token, newValue)
  })

  return balances
}

module.exports = {
  methodology:
    "TVL of Aura Finance consists of both the total deposited assets (fetched from the Aura Finance's Metrics API) and protocol-controlled value via veBAL (fetched on-chain)",
  misrepresentedTokens: true,
  timetravel: false,
  ethereum: {
    tvl
  },
};
