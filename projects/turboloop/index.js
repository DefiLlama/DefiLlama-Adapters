const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokens2 } = require('../helper/unwrapLPs');

// Turbo Loop main contract on BSC
const TURBOLOOP_CONTRACT = '0xc90E5785632dAaB9Cb61F5050dA393090541A76D';

async function tvl(api) {
  return sumTokens2({
    api,
    owner: TURBOLOOP_CONTRACT,
    tokens: [ADDRESSES.bsc.USDT, ADDRESSES.bsc.USDC],
    resolveUniV3: true
  });
}

module.exports = {
  methodology: 'TVL is calculated by summing the USDT and USDC stablecoin balances held in the Turbo Loop smart contract, representing user deposits in LP-backed yield farming strategies.',
  start: '2025-01-15',
  bsc: {
    tvl,
  }
};
