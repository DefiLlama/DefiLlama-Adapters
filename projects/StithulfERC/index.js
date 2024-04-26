const { getUniTVL } = require('../helper/unknownTokens')

const config = {
  bsc: '0x9df9de5ed89adbbd9fa2c14691903a0de9048a87',
}

async function bscTVL() {
  // Implement logic to fetch TVL data from the bsc protocol
  const tvl = await fetchTvlFromBscApi();
  return tvl;
}

module.exports = {
  tvl: bscTVL,
  misrepresentedTokens: false,
}
