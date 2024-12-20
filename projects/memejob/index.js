
const { get } = require('../helper/http')

const MIRROR_NODE_API_V1 = 'https://mainnet-public.mirrornode.hedera.com/api/v1'
const MEMEJOB_CONTRACT = "0x950230ea77Dc168df543609c2349C87dea57e876";

async function getContractBalance(contractAddress) {
  const response = await get(`${MIRROR_NODE_API_V1}/accounts/${contractAddress}`);
  if (response && response.balance) {
    return response.balance.balance;
  }
  throw new Error(`Failed to fetch balance for contract: ${contractAddress}`);
}

async function tvl() {
  const totalHbarBalance = await getContractBalance(MEMEJOB_CONTRACT);

  return {
    hbar: totalHbarBalance,
  };
}

module.exports = {
  methodology: "TVL is represented by all HBAR held in active bonding curves within MemeJob.",
  hedera: {
    tvl,
  },
};