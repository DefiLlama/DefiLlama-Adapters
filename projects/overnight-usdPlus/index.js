const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");

const m2m = {
    polygon: "0x33efB0868A6f12aEce19B451e0fcf62302Ec4A72",
    bsc: "0x9Af655c4DBe940962F776b685d6700F538B90fcf",
    optimism: "0x9Af655c4DBe940962F776b685d6700F538B90fcf",
    arbitrum: "0x9Af655c4DBe940962F776b685d6700F538B90fcf",
    era: "0x240aad990FFc5F04F11593fF4dCF1fF714d6fc80",
}

const assets = {
    polygon: ADDRESSES.polygon.USDC, //USDC
    bsc: ADDRESSES.bsc.BUSD, //BUSD
    optimism: ADDRESSES.optimism.USDC, //USDC
    arbitrum: ADDRESSES.arbitrum.USDC, //USDC
    era: ADDRESSES.era.USDC,
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