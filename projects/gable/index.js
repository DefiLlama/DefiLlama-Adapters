const { get } = require('../helper/http')

async function tvl(_, _b, _cb, { api, }) {
  const response = await get('https://www.sundaefinance.net:8443/api/tvl_data');

    // Check if lsu_locked and xrd_locked are valid numbers before parsing
    const lsuLocked = parseFloat(response.lsu_locked)
    const xrdLocked = parseFloat(response.xrd_locked)

  return {
    'radix': xrdLocked + lsuLocked
  }
}

module.exports = {
  timetravel: false,
  radixdlt: { tvl }
}