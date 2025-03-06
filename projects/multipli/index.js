const axios = require("axios")


async function getTvlByChain(chain) {
    const tvl_response = (await axios.get("https://api.multipli.fi/multipli/v2/external-aggregator/defillama/tvl"))
    const tvl = tvl_response.data['payload'][chain]

    return tvl
}


module.exports = {
    ethereum: {
        tvl: () => getTvlByChain('ethereum')
    },
    bsc: {
        tvl: () => getTvlByChain('bsc')
    }
}

