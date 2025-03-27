const { default: axios } = require("axios")

const ensoApi = 'https://service.ensofi.xyz/api/defilama'

const network = {
  eclipse: 'ECLIPSE'
}

async function fetchTvlByNetwork(api) {
  const res = await axios.get(`${ensoApi}/tvl/${network.eclipse}`);
  Object.entries(res.data.data).forEach(([key, value]) => {
    api.add(key, value);
  })
}

module.exports = {
  eclipse: {
    tvl: fetchTvlByNetwork
  }
}
