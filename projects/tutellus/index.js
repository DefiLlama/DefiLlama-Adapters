const { get } = require('../helper/http')

module.exports = {
  polygon: {
    tvl: () => ({}),
    staking: tvl,
  },
  timetravel: false,
  methodology: "Counts the number of TUT tokens locked in Tutellus contracts.",
}

async function tvl(api) {
  const endpoint = 'https://backend.tutellus.io/api'
  const data  = await get(endpoint + `/tvl`,  { data: { id: 1, jsonrpc: "2.0", method: "invokefunction", }});
  api.add('0x12a34A6759c871C4C1E8A0A42CFc97e4D7Aaf68d', data.bigNumber);
}