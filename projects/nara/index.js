// NARA Protocol — DeFi Llama TVL Adapter
// Chain: Base Mainnet
// TVL: NARA locked in NARAEngineV2 + Uniswap V3 NARA/WETH pool

const NARA_TOKEN = '0xE444de61752bD13D1D37Ee59c31ef4e489bd727C';
const NARA_ENGINE = '0x62250aEE40F37e2eb2cd300E5a429d7096C8868F';
const NARA_WETH_POOL = '0x71528CC56F44950aA74C3D656D2bD3502BAD2e91';
const WETH = '0x4200000000000000000000000000000000000006'; // WETH on Base

async function tvl(api) {
  const balances = await Promise.all([
    // NARA locked in the engine (core TVL)
    api.call({ abi: 'erc20:balanceOf', target: NARA_TOKEN, params: [NARA_ENGINE] }),
    // WETH in Uniswap V3 pool — known price, anchors NARA pricing
    api.call({ abi: 'erc20:balanceOf', target: WETH, params: [NARA_WETH_POOL] }),
    // NARA in Uniswap V3 pool
    api.call({ abi: 'erc20:balanceOf', target: NARA_TOKEN, params: [NARA_WETH_POOL] }),
  ]);

  api.add(NARA_TOKEN, balances[0]);
  api.add(WETH, balances[1]);
  api.add(NARA_TOKEN, balances[2]);
}

module.exports = {
  methodology: 'TVL is the total NARA locked in NARAEngineV2 plus liquidity in the Uniswap V3 NARA/WETH pool. Users lock NARA for a chosen duration and earn NARA + ETH rewards every 15-minute epoch.',
  start: 43471223, // NARAEngineV2 deployment on Base (Mar-17-2026)
  base: {
    tvl,
  },
};
