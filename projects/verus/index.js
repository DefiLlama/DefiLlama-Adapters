// draft code for the DeFiLlama team verification

const axios = require('axios');

export default {
  adapter: {
    yourCryptocurrency: {
      fetch: async (timestamp) => {
        const coinSupply = await getCoinSupply();
        const networkDifficulty = await getNetworkDifficulty();
        const distribution = await getDistribution();
        const blockHeight = await getBlockHeight();
        const currencyId = await getCurrencyId();
        const priceUsd = await getPriceUsd();
        const ethCurrencies = await getEthCurrencies();
        const networkHashrate = await getNetworkHashrate();

        return {
          timestamp,
          coinSupply,
          networkDifficulty,
          distribution,
          blockHeight,
          currencyId,
          priceUsd,
          ethCurrencies,
          networkHashrate
        };
      },
    },
  },
};

async function getCoinSupply() {
  const response = await axios.get(`${API_URL}/getcoinsupply`);
  return parseFloat(response.data[0]);
}

async function getNetworkDifficulty() {
  const response = await axios.get(`${API_URL}/difficulty`);
  return response.data.trim();
}

async function getDistribution() {
  const response = await axios.get(`${API_URL}/distribution`);
  return response.data;
}

async function getBlockHeight() {
  const response = await axios.get(`${API_URL}/blockcount`);
  return parseInt(response.data.trim());
}

async function getCurrencyId() {
  const response = await axios.get(`${API_URL}/getcurrid/VRSC`);
  return response.data.currencyid;
}

async function getPriceUsd() {
  const response = await axios.get(`${API_URL}/price/usd`);
  return response.data['verus-coin'].usd;
}

async function getEthCurrencies() {
  const response = await axios.get(`${API_URL}/getcurrencies`);
  return response.data;
}

async function getNetworkHashrate() {
  const response = await axios.get(`${API_URL}/getnethashpower`);
  return response.data[0];
}
