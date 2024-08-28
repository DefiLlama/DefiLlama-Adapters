const { sumERC4626VaultsExport } = require('../helper/erc4626')
const {sumTokensExport} = require("../helper/unwrapLPs");
const ADDRESSES = require('../helper/coreAssets.json')

// LINEA
const LINEA_VAULT = "0xB838Eb4F224c2454F2529213721500faf732bf4d"

// BLAST
const BLAST_VAULT = "0xbb4e01B8940E8E2b3a95cED7941969D033786FF7"
// BLAST PRICE FEED
const API3_ULTRAETHS_WSTETH = "0xa65a1fBe2cE3861E8F89bB912F170fcFd5a6b84e"
const API3_WSTETH_ETH = "0xD44cD8e42Ff375e9Fd13fEf75E82c20687D047f6"

async function addL2TVLBlast(api) {
  const tokens = await api.call({abi: 'erc20:totalSupply', target: BLAST_VAULT})
  const decimals = await api.call({abi: 'uint256:decimals', target: BLAST_VAULT})
  const priceInWstETH = (await api.call({abi: 'uint256:read', target: API3_ULTRAETHS_WSTETH})) / 10 ** decimals
  const wstETHtoETH = (await api.call({abi: 'uint256:read', target: API3_WSTETH_ETH})) / 10 ** decimals

  const totalInEth = (tokens * priceInWstETH) * wstETHtoETH
  api.addGasToken(totalInEth)
}

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
  blast: {
    tvl: async (api) => await addL2TVLBlast(api)
  }
}
