const axios = require("axios");

async function fetch() {
  const vaults = (await axios.get('https://api.robo-vault.com/vault')).data
  return vaults.map(e => e.tvlUsd).filter(e => e != undefined).reduce((a, b) => a + b, 0)
}

module.exports = {
  fetch
}
