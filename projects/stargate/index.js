const axios = require('axios');

const STARGATE_CONTRACT = '0x1856c533ac2d94340aaa8544d35a5c1d4a21dee7';
const VET_ADDRESS = '0x0000000000000000000000000000000000000000';
const NODE_URL = 'https://mainnet.vechain.org';

async function getTotalVetStaked() {
  const resp = await axios.get(`${NODE_URL}/accounts/${STARGATE_CONTRACT}`);
  const balance = resp.data.balance;
  return BigInt(balance);
}

async function tvl(api) {
  const totalVetStaked = await getTotalVetStaked();

  api.add(VET_ADDRESS, totalVetStaked)
}

module.exports = {
  timetravel: false, 
  misrepresentedTokens: false,
  methodology: 'Reads the total VET staked in the Stargate contract',
  vechain: { tvl },
};
