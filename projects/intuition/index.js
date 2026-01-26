const { sumTokensExport, nullAddress } = require('../helper/unwrapLPs');

const ETHMULTIVAULT = "0x430BbF52503Bd4801E51182f4cB9f8F534225DE5"; // Intuition's EthMultiVault contract address on Base mainnet

module.exports = {
  methodology: "The TVL is calculated based on the current ETH balance held within Intuition's EthMultiVault contract on the Base mainnet.",
  base: {
    tvl: sumTokensExport({ owner: ETHMULTIVAULT, tokens: [nullAddress] }),
  }
}
