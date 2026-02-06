const ADDRESSES = require('../helper/coreAssets.json')
const axios = require('axios');

const STARGATE_CONTRACT = '0x03C557bE98123fdb6faD325328AC6eB77de7248C';
const VET_ADDRESS = ADDRESSES.null;
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
  methodology: 'Reads the total VET staked in the active Stargate staking contract on VeChain',
  vechain: { tvl },
};
