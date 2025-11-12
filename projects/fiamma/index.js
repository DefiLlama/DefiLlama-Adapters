const axios = require("axios")

const btc_locked = async (api) => {
    const response = (await axios.post('https://bridge-api.fiammachain.io', { "jsonrpc": "2.0", "id": 1, "method": "frontend_queryBridgeTVL", "params": {} })).data
    const locked = response.result.total_tvl / 1e8
    api.addCGToken('bitcoin', locked)
}

module.exports = {
    methodology: "Fiamma BTC TVL represents the total amount of Bitcoin bridged across all chains through the Fiamma Bridge, a trust‑minimized bridge built on the BitVM2 protocol.",
    bitcoin: {
      tvl: btc_locked,
    }
  };