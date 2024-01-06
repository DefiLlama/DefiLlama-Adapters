const { sumTokensExport, sumTokens2 } = require('../helper/unwrapLPs');

// Constants for Ethereum chain
const ASTRA_TOKEN_CONTRACT_ETHEREUM = '0x7E9c15C43f0D6C4a12E6bdfF7c7D55D0f80e3E23';
const ASTRA_STAKING_CONTRACT_ETHEREUM = '0xDFE672C671943411fc16197fb8E328662B57CE2C';

// Constants for Arbitrum chain
const ASTRA_TOKEN_CONTRACT_ARBITRUM = '0xd3188e0df68559c0B63361f6160c57Ad88B239D8';
const ASTRA_STAKING_CONTRACT_ARBITRUM = '0x6fE79b531b2b1d5378631B3Ab33B0994E297355E';

async function tvl(_, _b, _cb, { api, chain }) {
  let gotError = false;
  const indexAddr = chain === 'ethereum' ? '0x17b9B197E422820b3e28629a2BB101949EE7D12B' : '0x8e265fF847CC660Cd89786D4308076a9f921428f';
  const stableCoin = await api.call({ abi: 'address:baseStableCoin', target: indexAddr });
  let i = 0;
  const tokens = [stableCoin];
  do {
    try {
      const _tokens = await api.call({ abi: 'function getIndexTokenDetails(uint256) view returns (address[])', target: indexAddr, params: i });
      tokens.push(..._tokens);
      i++;
    } catch (e) {
      if (i === 0) throw e;
      gotError = true;
    }
  } while (!gotError);
  return sumTokens2({ api, owner: indexAddr, tokens });
}

module.exports = {
  start: 17243078,
  ethereum: {
    tvl,
   // pool2: sumTokensExport({ owner: ASTRA_STAKING_CONTRACT_ETHEREUM, resolveUniV3: true }),
   // staking: sumTokensExport({ owner: ASTRA_STAKING_CONTRACT_ETHEREUM, tokens: [ASTRA_TOKEN_CONTRACT_ETHEREUM] }),
  },
  arbitrum: {
    tvl,
    pool2: sumTokensExport({ owner: ASTRA_STAKING_CONTRACT_ARBITRUM, resolveUniV3: true }),
    staking: sumTokensExport({ owner: ASTRA_STAKING_CONTRACT_ARBITRUM, tokens: [ASTRA_TOKEN_CONTRACT_ARBITRUM] }),
  },
  hallmarks: [
    [Math.floor(new Date('2023-09-14') / 1e3), 'Security Incident'],
    [Math.floor(new Date('2024-01-04') / 1e3), 'Arbitrum Launch'],
  ],
};
