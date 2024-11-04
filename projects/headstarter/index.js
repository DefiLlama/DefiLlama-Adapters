const { get } = require('../helper/http')
const HST_TOKEN_CONTRACT = "0x00000000000000000000000000000000000ec585"
const IDO_CONTRACTS = ["0x00000000000000000000000000000000000f5ad1", "0x00000000000000000000000000000000000fc16c", "0x0000000000000000000000000000000000101201"]
const STAKING_CONTRACT = "0x00000000000000000000000000000000000ec553"

const MIRROR_NODE_API_V1 = 'https://mainnet-public.mirrornode.hedera.com/api/v1'

async function getCurrentBlock() {
  const { blocks: [{ number }]} = await get(MIRROR_NODE_API_V1+'/blocks?limit=1&order=desc')
  return number
}


async function tvl(api) {
  const block = await getCurrentBlock()
  const balances = await Promise.all(
    IDO_CONTRACTS.map(async (contract) => {      
      const contractBalance = await api.call({
        abi: 'erc20:balanceOf',
        target: HST_TOKEN_CONTRACT,
        params: contract,
        block,
      });

      return Number(contractBalance);
    })
  );

  const totalBalance = balances.reduce((acc, balance) => acc + balance, 0);

  api.add(HST_TOKEN_CONTRACT, totalBalance)
}

async function staking(api) {
  const block = await getCurrentBlock()
  const stakingBalances = await api.call({
    abi: 'erc20:balanceOf',
    target: HST_TOKEN_CONTRACT,
    params: STAKING_CONTRACT,
    block
  });

  api.add(HST_TOKEN_CONTRACT, stakingBalances)
}

module.exports = {
  methodology: "We count the HST tokens locked in the HeadStarter contracts.",
  hedera: {
    tvl,
    staking
  }
}; 