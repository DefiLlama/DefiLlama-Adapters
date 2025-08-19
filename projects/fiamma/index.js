const sdk = require('@defillama/sdk')
const axios = require("axios")
const { function_view } = require('../helper/chain/aptos')

const FIABTC_ETHEREUM = '0x22F0E0a4c97ff43546dad16d43Ef854C773F0e08'
const FIABTC_BSC = '0xafB253A80CEb3d1a5eeF3994C0d1C92c2f027524'
const FIABTC_SEI = '0x60C230c38aF6d86b0277a98a1CAeAA345a7B061F'
const FIABTC_ARBITRUM = '0x60C230c38aF6d86b0277a98a1CAeAA345a7B061F'
const FIABTC_BASE = '0x60C230c38aF6d86b0277a98a1CAeAA345a7B061F'
const FIABTC_ZKSYNC = '0x60C230c38aF6d86b0277a98a1CAeAA345a7B061F'
const FIABTC_POLYGON = '0x60C230c38aF6d86b0277a98a1CAeAA345a7B061F'
const FIABTC_UNICHAIN = '0x60C230c38aF6d86b0277a98a1CAeAA345a7B061F'
const FIABTC_PLUME = '0x60C230c38aF6d86b0277a98a1CAeAA345a7B061F'
const FIABTC_APTOS = '0x75de592a7e62e6224d13763c392190fda8635ebb79c798a5e9dd0840102f3f93'

const ethereum_tvl = async (api) => {
    const supply = await api.call({ abi: 'erc20:totalSupply', target: FIABTC_ETHEREUM })
    api.add(FIABTC_ETHEREUM, supply)
}

const bsc_tvl = async (api) => {
    const supply = await api.call({ abi: 'erc20:totalSupply', target: FIABTC_BSC })
    api.add(FIABTC_BSC, supply)
}

const sei_tvl = async (api) => {
    const supply = await api.call({ abi: 'erc20:totalSupply', target: FIABTC_SEI })
    api.add(FIABTC_SEI, supply)
}

const arbitrum_tvl = async (api) => {
    const supply = await api.call({ abi: 'erc20:totalSupply', target: FIABTC_ARBITRUM })
    api.add(FIABTC_ARBITRUM, supply)
}

const base_tvl = async (api) => {
    const supply = await api.call({ abi: 'erc20:totalSupply', target: FIABTC_BASE })
    api.add(FIABTC_BASE, supply)
}

const zksync_tvl = async (api) => {
    const supply = await api.call({ abi: 'erc20:totalSupply', target: FIABTC_ZKSYNC })
    api.add(FIABTC_ZKSYNC, supply)
}

const polygon_tvl = async (api) => {
    const supply = await api.call({ abi: 'erc20:totalSupply', target: FIABTC_POLYGON })
    api.add(FIABTC_POLYGON, supply)
}

const unichain_tvl = async (api) => {
    const supply = await api.call({ abi: 'erc20:totalSupply', target: FIABTC_UNICHAIN })
    api.add(FIABTC_UNICHAIN, supply)
}

const plume_tvl = async (api) => {
    const supply = await api.call({ abi: 'erc20:totalSupply', target: FIABTC_PLUME })
    api.add(FIABTC_PLUME, supply)
}

const aptos_tvl = async (api) => {
    const response = (await axios.post('https://fullnode.mainnet.aptoslabs.com/v1/view', { "function": "0x1::fungible_asset::supply", "type_arguments": ["0x1::fungible_asset::Metadata"], arguments: [FIABTC_APTOS] })).data
    const supply = response[0].vec[0]
    const btcAmount = parseInt(supply) / 1e8
    api.addCGToken('bitcoin', btcAmount)
}

const btc_locked = async (api) => {
    const response = (await axios.post('https://bridge-api.fiammachain.io', { "jsonrpc": "2.0", "id": 1, "method": "frontend_queryBridgeTVL", "params": {} })).data
    const locked = response.result.total_tvl / 1e8
    api.addCGToken('bitcoin', locked)
}

module.exports = {
    methodology: "Fiamma BTC TVL represents the total amount of Bitcoin bridged across all chains through the Fiamma Bridge, a trust‑minimized bridge built on the BitVM2 protocol.",
    bitcoin: {
      tvl: btc_locked,
    },
    ethereum: {
      tvl: ethereum_tvl,
    },
    bsc: {
      tvl: bsc_tvl,
    },
    sei: {
      tvl: sei_tvl,
    },
    arbitrum: {
      tvl: arbitrum_tvl,
    },
    base: {
      tvl: base_tvl,
    },
    era: {
      tvl: zksync_tvl,
    },
    polygon: {
      tvl: polygon_tvl,
    },
    unichain: {
      tvl: unichain_tvl,
    },
    plume: {
      tvl: plume_tvl,
    },
    aptos: {
      tvl: aptos_tvl,
    },
  };