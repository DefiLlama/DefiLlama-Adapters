// NARA Protocol — DeFi Llama TVL Adapter
// Chain: Base Mainnet
// TVL: Total NARA locked in NARAEngineV2 contract

const NARA_TOKEN = '0xE444de61752bD13D1D37Ee59c31ef4e489bd727C';
const NARA_ENGINE = '0x62250aEE40F37e2eb2cd300E5a429d7096C8868F';

async function tvl(api) {
  // Query total NARA locked in the engine
  const locked = await api.call({
    abi: 'erc20:balanceOf',
    target: NARA_TOKEN,
    params: [NARA_ENGINE],
  });

  // Register as TVL
  api.add(NARA_TOKEN, locked);
}

module.exports = {
  methodology: 'TVL is the total NARA locked in NARAEngineV2. Users lock NARA for a chosen duration and earn proportional NARA + ETH rewards every 15-minute epoch.',
  start: 43471223,  // NARAEngineV2 deployment on Base (Mar-17-2026)
  base: {
    tvl,
  },
};
