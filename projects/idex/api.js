const axios = require('axios');

const client = axios.create({
  baseURL: 'https://api.idex.io/v1',
  headers: {
    'User-Agent': 'defi-pulse-adapter'
  }
})

/**
 * Capture the assets from the IDEX v2 API
 *
 * @see https://docs.idex.io/#get-assets
 */
async function getAssets() {
  const { data } = await client.get('assets');

  return data
}

module.exports = {
  getAssets
}
