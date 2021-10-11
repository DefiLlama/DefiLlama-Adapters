const sdk = require('@defillama/sdk');
const safelist = require('./safelist.json');

const vanillaRouterAddress = '0x72C8B3aA6eD2fF68022691ecD21AEb1517CfAEa6'

async function tvl(timestamp, block) {
  let balances = {}

  const targets = safelist.map(token => {
    return { target: token.address, params: vanillaRouterAddress }
  })
  const responses = await sdk.api.abi.multiCall({
    calls: targets,
    abi: 'erc20:balanceOf',
    block: block
  });
  
  responses.output.forEach(response => {
    balances[response.input.target] = response.output
  })

  return balances;
}

module.exports = {
  name: 'Vanilla',
  website: 'https://vanilladefi.com',
  token: 'VNL',              
  category: 'derivatives',
  tvl
}
