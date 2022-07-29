const axios = require("axios");

function fetch(endpoint) {
  return async () => {
    const vaults = (await axios.get(`https://api.robo-vault.com/${endpoint}`)).data;
    return vaults
      .filter((p) => p.status.toLowerCase() === 'active')
      .map(e => e.tvlUsd).filter(e => e != undefined).reduce((a, b) => a + b, 0);
  };
};

module.exports = {
  methodology: 'TVL counts deposits made to the Robo-Vault vaults. Data is pulled from the Robo-Vault API:"https://api.robo-vault.com/vault".',
  polygon: {
    fetch: fetch('vaults/polygon')
  },
  fantom: {
    fetch: fetch('vaults/fantom')
  },
  avalanche:{
    fetch: fetch('vaults/avalanche')
  },
  fetch: fetch('vaults'),
}; // node test.js projects/robovault/index.js
