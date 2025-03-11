const { default: axios } = require("axios")

const ensoApi = 'https://service.devnet.ensofi.xyz/api/defilama'

const network = {
  eclipse: 'ECLIPSE'
}

async function fetchTvlByNetwork(network) {
  return (await axios.get(`${ensoApi}/tvl/${network}`)).data
}

module.exports = {
  eclipse: {
    tvl: fetchTvlByNetwork(network.eclipse),
  }
}