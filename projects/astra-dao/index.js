const { sumTokensExport, sumTokens2 } = require('../helper/unwrapLPs');

const ASTRA_TOKEN_CONTRACT_ARBITRUM = '0xd3188e0df68559c0B63361f6160c57Ad88B239D8';
const ASTRA_STAKING_CONTRACT_ARBITRUM = '0x6fE79b531b2b1d5378631B3Ab33B0994E297355E';

async function tvl(api) {
  const chain = api.chain
  const indexAddr = chain === 'ethereum' ? '0x17b9B197E422820b3e28629a2BB101949EE7D12B' : '0xFa3e6EC87941d4e29b1738F8F7f5C27B23Eb3f94';
  const stableCoin = await api.call({ abi: 'address:baseStableCoin', target: indexAddr });
  const tokens = [stableCoin];
  const _tokens = await api.fetchList({ itemAbi: 'function getIndexTokenDetails(uint256) view returns (address[])', target: indexAddr, itemCount: 10, permitFailure: true, excludeFailed: true, });
  tokens.push(..._tokens.flat());
  return sumTokens2({ api, owner: indexAddr, tokens });
}

module.exports = {
  ethereum: {
    tvl,
  },
  arbitrum: {
    tvl,
    pool2: sumTokensExport({ owner: ASTRA_STAKING_CONTRACT_ARBITRUM, resolveUniV3: true }),
    staking: sumTokensExport({ owner: ASTRA_STAKING_CONTRACT_ARBITRUM, tokens: [ASTRA_TOKEN_CONTRACT_ARBITRUM] }),
  },
  hallmarks: [
    ['2023-09-14', 'Security Incident'],
    ['2024-01-04', 'Arbitrum Launch'],
    ['2024-03-29', 'Shutdown Indices and Distributed User Funds'],
    ['2024-04-05', 'Launched New Indices'],
  ],
};
