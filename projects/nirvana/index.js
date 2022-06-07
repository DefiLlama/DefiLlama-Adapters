const axios = require("axios");
const NIRVANA_API = "https://us-central1-nirvana-91051.cloudfunctions.net";

const client = axios.create({
  baseURL: NIRVANA_API,
});

async function getTvl(){
  const metrics = await client.get("/getLlama")
  const { tvl } = metrics.data
  return tvl;
}

const tvl = await getTvl();

module.exports = {
  methodology: 'The total value of ANA tokens locked in the protocol, either as staking or as collateral for loans.',
  solana: {
    tvl
  }
}
