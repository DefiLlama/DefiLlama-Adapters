
const { get } = require('../helper/http')
const MIRROR_NODE_API_V1 = 'https://mainnet-public.mirrornode.hedera.com/api/v1'
const MEMEJOB_CONTRACT = "0x950230ea77Dc168df543609c2349C87dea57e876";

async function tvl() {
  const response = await get(`${MIRROR_NODE_API_V1}/accounts/${MEMEJOB_CONTRACT}`);
  
  if (response && response.balance) {
    const totalHbarBalance = response.balance.balance / 100000000;
    return {
      "hedera-hashgraph": totalHbarBalance
    };
  }
  
  throw new Error(`Failed to fetch balance for contract: ${MEMEJOB_CONTRACT}`);
}

module.exports = {
  methodology: "TVL is represented by all HBAR held in active bonding curves within MemeJob.",
  hedera: {
    tvl,
  },
};