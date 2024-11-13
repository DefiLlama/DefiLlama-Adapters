const axios = require("axios");

const EXPLORER_API = 'https://explorer.mintlayer.org/api';
const client = axios.create({ baseURL: EXPLORER_API });

async function summary () {
  const response = await client.get('/summary');
  const data = response.data;
  return data;
}

module.exports = {
  summary,
}
