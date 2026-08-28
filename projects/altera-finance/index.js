const { sumTokens2 } = require('../helper/unwrapLPs')

const strategyCountAbi = 'uint:strategyCount';
const strategiesAbi = 'function strategies(uint256) returns (address)';
const getAllPoolsAbi = 'function getAllPoolsTVL() view returns ((address token, uint8 decimals, uint256 amount)[])';

const config = { ethereum: {pm: '0xf24F99795D1Cb1F0816101D4e0A41a84b44ac8c3', poolInfo: '0x5072fF50B5ad5ED1Fe87b934cbFdB679394E1B1a'} };

async function tvl(api) {
  const {pm, poolInfo} = config[api.chain]
  const strategies = await api.fetchList({ lengthAbi: strategyCountAbi, itemAbi: strategiesAbi, target: pm })
  const pools = await api.call({ abi: getAllPoolsAbi, target: poolInfo })
  const tokens = pools.map(p => p.token)

  return sumTokens2({ api, tokens, owners: [...strategies, pm], resolveUniV3: true })
}

module.exports = {
  methodology: 'TVL is the value of tokens held by the PositionManager and all Uniswap v3 positions held by Altera strategy contracts.',
  ethereum: { tvl },
}
