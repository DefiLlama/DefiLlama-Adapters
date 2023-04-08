const sdk = require("@defillama/sdk");

const m2m = {
    polygon: "0x33efB0868A6f12aEce19B451e0fcf62302Ec4A72",
    bsc: "0x9Af655c4DBe940962F776b685d6700F538B90fcf",
    optimism: "0x9Af655c4DBe940962F776b685d6700F538B90fcf",
    arbitrum: "0x9Af655c4DBe940962F776b685d6700F538B90fcf",
    zksync: "0x240aad990FFc5F04F11593fF4dCF1fF714d6fc80",
}

const assets = {
    polygon: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174", //USDC
    bsc: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56", //BUSD
    optimism: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607", //USDC
    arbitrum: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8", //USDC
    zksync: "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8",
}

const abi = "uint256:totalNetAssets"

module.exports = {};

Object.keys(m2m).forEach(chain => {
  module.exports[chain] = {
    tvl: async (_, _b, cb) => {
        const block = cb[chain]
        const { output } = await sdk.api.abi.call({ chain, block, abi, target: m2m[chain]})
        return {
            [`${chain}:${assets[chain]}`]: output
        }
    }
  }
})