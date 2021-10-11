const retry = require('./helper/retry');
const axios = require('axios');

async function fetch() {
  const tvl = (
    await retry(
      async (bail) => await axios.get('https://cache.rune.game/runes/rune/tvl')
    )
  ).data;

  return tvl || 0;
}

module.exports = {
  fetch,
};