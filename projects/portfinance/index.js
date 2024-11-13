const { sumTokens2 } = require('../helper/solana')

async function tvl() {
  return sumTokens2({ owners: [
    '4bf5HQQZ9qtGGCuxYNnhiTrKpTMTX6HSoLy5a7wUjCEb', // Hedge Innovation Zone
    '8x2uay8UgrLiX8AAYyF6AkK9z91nNtN6aLwfqPkf6TAQ', // Main Pool
    'GU1nCjN7mcLiSX1dtBw2t9agYCw3ybXfu1me41Q2tGT3', // Hubble Innovation Zone
    'Hy6gCkJyMmWMaoxLyzELRReLzdBdZ1YEjNGjQzF9LDPa', // UXD Innovation Zone
  ], })
}

module.exports = {
  timetravel: false,
  solana: {
    tvl
  },
};
