const { get } = require('../helper/http')

const ENTITIES = [
{
    token: "0x00000000000000000000000000000000000ec585",
    contracts: [
      "0x00000000000000000000000000000000000f5ad1",
      "0x00000000000000000000000000000000000fc16c",
      "0x0000000000000000000000000000000000101201",
      "0x0000000000000000000000000000000000575c04"
    ]
  },
 {
    token: "0x000000000000000000000000000000000048fda4",
    contracts: [
      "0x00000000000000000000000000000000004e3387",
      "0x00000000000000000000000000000000004e3395",
      "0x00000000000000000000000000000000004d6daa",
      "0x0000000000000000000000000000000000575c04"
    ]
  },
  {
    token: "0x000000000000000000000000000000000030fb8b",
    contracts: [
      "0x00000000000000000000000000000000005737f0",
      "0x00000000000000000000000000000000005737e1",
      "0x0000000000000000000000000000000000571a8d",
      "0x0000000000000000000000000000000000571a8a",
      "0x000000000000000000000000000000000056d9ea",
      "0x0000000000000000000000000000000000575c04"
    ]
  },
  {
    token: "0x00000000000000000000000000000000005c9f70",
    contracts: [
      "0x00000000000000000000000000000000005cb45b",
      "0x00000000000000000000000000000000005cb45f",
      "0x0000000000000000000000000000000000575c04"
    ]
  },
]

const STAKING_CONTRACT = "0x00000000000000000000000000000000000ec553"
const MIRROR_NODE_API_V1 = 'https://mainnet-public.mirrornode.hedera.com/api/v1'

async function getCurrentBlock() {
  const { blocks: [{ number }]} = await get(MIRROR_NODE_API_V1+'/blocks?limit=1&order=desc')
  return number
}

async function getTVLForToken(api, tokenContract, addresses, block) {
  const balances = await Promise.all(
    addresses.map(async (address) => {      
      const contractBalance = await api.call({
        abi: 'erc20:balanceOf',
        target: tokenContract,
        params: address,
        block,
      });

      return Number(contractBalance);
    })
  );

  return await balances.reduce((acc, balance) => acc + balance, 0);
}


async function tvl(api) { 
  const block = await getCurrentBlock();
  
  const tokens = ENTITIES.map(entity => entity.token);
  const balances = await Promise.all(
    ENTITIES.map(entity => getTVLForToken(api, entity.token, entity.contracts, block))
  );

  api.addTokens(tokens, balances);
}

async function staking(api) {
  const block = await getCurrentBlock()
  const stakingBalances = await api.call({
    abi: 'erc20:balanceOf',
    target: ENTITIES[0].token,
    params: STAKING_CONTRACT,
    block
  });


  api.add(ENTITIES[0].token, stakingBalances)
  
}

module.exports = {
  methodology: "We count the HST tokens locked in the HeadStarter contracts.",
  hedera: {
    tvl,
    staking
  }
}; 