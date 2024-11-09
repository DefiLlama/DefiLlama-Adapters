const YETH_POOL = '0x2cced4ffA804ADbe1269cDFc22D7904471aBdE63';

async function tvl(api) {
  const tokens = await api.fetchList({  lengthAbi: 'num_assets', itemAbi: 'assets', target: YETH_POOL})
  return api.sumTokens({ tokens, owner: YETH_POOL })
}

module.exports = {
  methodology: 'counts the total amount of ETH underlying the LSTs deposited into the yETH pool.',
  start: 1693971707,
  ethereum: { tvl }
};
