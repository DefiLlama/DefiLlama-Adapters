const sdk = require('@defillama/sdk');
const { sumTokens2, } = require('../helper/unwrapLPs')

const yETHPools = [
  '0x2cced4ffa804adbe1269cdfc22d7904471abde63',
  '0x0ca1bd1301191576bea9b9afcfd4649dd1ba6822',
  '0xCcd04073f4BdC4510927ea9Ba350875C3c65BF81',
]

async function tvl(api) {
  for (const pool of yETHPools) {
    const calls = []
    for (let i = 0; i < 10; i++) {
      calls.push({
        target: pool,
        params: [i],
      })
    }

    let tokens = await api.api.multiCall({
      abi: 'function assets(uint256) view returns (address)',
      calls: calls,
      permitFailure: true,
    });
    tokens = tokens.filter(token => token !== null)
    if (tokens.length > 0) {
      await sumTokens2({api, tokens, owner: pool})
    }
  }

  return api.getBalances()
}

module.exports = {
  methodology: 'counts the total amount of ETH underlying the LSTs deposited into the yETH pool.',
  start: '2023-09-06',
  ethereum: { tvl }
};
