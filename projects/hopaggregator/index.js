import axios from 'axios';

// Define the endpoint and any required headers or parameters
const API_URL = 'http://35.153.229.202/api/volume';

async function fetchVolume(timestamp) {
  const response = await axios.post(API_URL, {
    body: {
      timestamp
    }
  });
  const data = response.data;
  const record = data.record || {};

  let daily_volume = record.total_volume_usd;
  let total_volume = data.total_volume_usd;

  // Format the data according to DeFi Llama's requirements
  return {
    timestamp: timestamp,
    dailyVolume: daily_volume,
    totalVolume: total_volume,
  };
}

// Define the adapter
const adapter = {
  volume: {
    fetch: fetchVolume,
    start: async () => {
      // Return the timestamp from which your adapter can start fetching data
      return 1714276800000;
    },
  }
};

export default adapter;