const YETH_POOL = '0x0Ca1bd1301191576Bea9b9afCFD4649dD1Ba6822';

async function tvl(api) {
  const tokens = await api.fetchList({  lengthAbi: 'num_assets', itemAbi: 'assets', target: YETH_POOL})
  return api.sumTokens({ tokens, owner: YETH_POOL })
}

module.exports = {
  methodology: 'counts the total amount of ETH underlying the LSTs deposited into the yETH pool.',
  start: '2023-09-06',
  ethereum: { tvl }
};
