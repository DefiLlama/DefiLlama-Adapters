const { getLogs2 } = require("../helper/cache/getLogs");

const BSC_VAULT = '0x6f24f5EB8f50DE36C1D1FEcD31c423e1fc8ba4ae';
const BSC_FROM_BLOCK = 45524968;

const ARBITRUM_VAULT = '0x31206FFb663651aBe29cCb72aD213d5F95BdaC45';
const ARBITRUM_FROM_BLOCK = 293021794;

function strategiesTvl(vault, fromBlock) {
  return async (api) => {
    const logs = await getLogs2({
      api,
      target: vault,
      fromBlock,
      eventAbi: 'event PoolRegistered(bytes32 indexed poolId, address indexed poolAddress, uint8 specialization)',
      extraKey: 'PoolRegistered',
    })
    const logs2 = await getLogs2({
      api,
      target: vault,
      fromBlock,
      eventAbi: 'event TokensRegistered(bytes32 indexed poolId, address[] tokens, address[] assetManagers)',
      extraKey: 'TokensRegistered',
    })

    let tokens = logs2.map(i => i.tokens).flat()
    const blacklistedTokens = new Set(logs.map(i => i.poolAddress))
    tokens = tokens.filter(t => !blacklistedTokens.has(t))
    await addWrapperReserves(api, tokens)
  }
}

/**
 * Cadabra is a yield aggregator that channels user liquidity into third-party protocols.
 * Because each protocol handles tokens differently—such as issuing A-tokens when depositing into AAVE—we calculate
 * token balances based on how each wrapper contract represents them. These wrappers abstract the underlying protocols
 * and display token balances in their base form; for example, a wrapper holding AAVE's aUSDC reports its reserves as
 * USDC.
 */
async function addWrapperReserves(api, tokens) {
  const res = await api.multiCall({ abi: 'function reserves() view returns(address[] memory, uint256[] memory)', calls: tokens })
  res.forEach(([tokens, amounts]) => api.add(tokens, amounts))
}

module.exports = {
  methodology: `The TVL is calculated by summing all underlying reserves across our strategies`,
  doublecounted: true,
  bsc: {
    tvl: strategiesTvl(BSC_VAULT, BSC_FROM_BLOCK)
  },
  arbitrum: {
    tvl: strategiesTvl(ARBITRUM_VAULT, ARBITRUM_FROM_BLOCK)
  }
};
