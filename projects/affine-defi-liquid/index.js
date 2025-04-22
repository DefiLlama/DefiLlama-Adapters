const { sumERC4626VaultsExport } = require('../helper/erc4626')

// LINEA
const LINEA_VAULT = "0xB838Eb4F224c2454F2529213721500faf732bf4d"

async function addL2TVL(api, target) {
  const tokens = await api.call({abi: 'erc20:totalSupply', target: target})
  const sharePrice = await api.call({abi: 'uint256:sharePrice', target: target})
  const decimals = await api.call({abi: 'uint256:decimals', target: target})

  // Convert to human-readable format
  const totalInEth = tokens * sharePrice / 10 ** decimals

  api.addGasToken(totalInEth)
}

module.exports = {
  doublecounted: true,
  ethereum: {
    tvl: sumERC4626VaultsExport({
      vaults: [
        '0xcbC632833687DacDcc7DfaC96F6c5989381f4B47',
        '0xF0a949B935e367A94cDFe0F2A54892C2BC7b2131',
      ],
      isOG4626: true,
    }),
  },
  linea: {
    tvl: async (api) => await addL2TVL(api, LINEA_VAULT)
  },
}
