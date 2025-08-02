
const { staking } = require('../helper/staking');
const sdk = require('@defillama/sdk');

// === Constants ===
// Chains
const CHAIN_FANTOM = 'fantom';
const CHAIN_SONIC = 'sonic';

// Fantom
// const FACTORY = "0x733A9D1585f2d14c77b49d39BC7d7dd14CdA4aa5";
const MASTERCHEF_FANTOM = '0xCb80F529724B9620145230A0C866AC2FACBE4e3D';
const BRUSH_FANTOM = '0x85dec8c4b2680793661bca91a8f129607571863d';
const ART_GALLERY_FANTOM = '0x9076C96e01F6F13e1eC4832354dF970d245e124F';

// Sonic
// const BRUSH_SONIC = '0xe51ee9868c1f0d6cd968a8b8c8376dc2991bfe44'; 
// Order book
const SONIC_ORDER_BOOK_S_NATIVE = '0x9a7e4c8fe2679D43145Da69ff191a5C9F841996b';
const SONIC_ORDER_BOOK_USDC = '0xed286fd8f8364058778B80D69b2158Dd09edb634';
const SONIC_ORDER_BOOK_SCUSD = '0x575a809Ccc7d1e90D717b4E66928289F2d09db8F';
// ERC1155 contract holding native S 
const ERC1155_S_HOLDER = '0xe1401171219fd2fd37c8c04a8a753b07706f3567';

// Tokens
const USDC_TOKEN_ON_SONIC = '0x29219dd400f2bf60e5a23d13be72b486d4038894'; // 6 decimals
const SCUSD_TOKEN_ON_SONIC = '0xd3DCe716f3eF535C5Ff8d041c1A41C3bd89b97aE'; // 6 decimals 
// native S
const NULL = '0x0000000000000000000000000000000000000000';

// --- Helpers ---
async function safeGetNativeBalance(api, address) {
  try {
    if (typeof api.getNativeBalance === 'function') {
      return await api.getNativeBalance(address);
    } else if (api.provider && typeof api.provider.getBalance === 'function') {
      const bal = await api.provider.getBalance(address);
      return bal.toString();
    }
  } catch (e) {
    // ignore
  }
  return null;
}

// --- Fantom adapter ---
async function getFantomTvl(_, _b, _c, { api }) {
  await api.sumTokens({
    owner: ART_GALLERY_FANTOM,
    tokens: [BRUSH_FANTOM],
    chain: CHAIN_FANTOM,
  });

  return api.getBalances();
}
const fantomAdapter = {
  tvl: getFantomTvl,
  staking: staking(MASTERCHEF_FANTOM, BRUSH_FANTOM, CHAIN_FANTOM),
};

// --- Sonic adapter ---
async function getSonicTvl(_, _b, _c, { api }) {
  // USDC on its order book
  const usdcBalanceRes = await sdk.api.erc20.balanceOf({
    target: USDC_TOKEN_ON_SONIC,
    owner: SONIC_ORDER_BOOK_USDC,
    chain: CHAIN_SONIC,
  });
  if (usdcBalanceRes && usdcBalanceRes.output) {
    api.add(USDC_TOKEN_ON_SONIC, usdcBalanceRes.output);
  }

  // scUSD on its order book
  const scusdBalanceRes = await sdk.api.erc20.balanceOf({
    target: SCUSD_TOKEN_ON_SONIC,
    owner: SONIC_ORDER_BOOK_SCUSD,
    chain: CHAIN_SONIC,
  });
  if (scusdBalanceRes && scusdBalanceRes.output) {
    api.add(SCUSD_TOKEN_ON_SONIC, scusdBalanceRes.output);
  }

  // Native S on its order book, use key '0x0...'
  const nativeSBalanceOrderBook = await safeGetNativeBalance(api, SONIC_ORDER_BOOK_S_NATIVE);
  if (nativeSBalanceOrderBook) {
    api.add(NULL, nativeSBalanceOrderBook);
  }

  return api.getBalances();
}

async function getSonicStaking(_, _b, _c, { api }) {
  // Native S held in the ERC1155 contract is treated as staking TVL, use key '0x0...'
  const nativeSFromERC1155 = await safeGetNativeBalance(api, ERC1155_S_HOLDER);
  if (nativeSFromERC1155) {
    api.add(NULL, nativeSFromERC1155);
  }
  return api.getBalances();
}

const sonicAdapter = {
  tvl: getSonicTvl,
  staking: getSonicStaking,
};

module.exports = {
  methodology: `
TVL:
  - Fantom: BRUSH locked in the Art Gallery.
  - Sonic: liquidity for native S, USDC, and scUSD on the Order Books.
Staking:
  - Fantom: BRUSH staking via masterchef.
  - Sonic: native S held in the ERC1155 airdrop NFT contract.
`,
  start: 1618876800,
  fantom: {
    tvl: fantomAdapter.tvl,
    staking: fantomAdapter.staking,
  },
  sonic: {
    tvl: sonicAdapter.tvl,
    staking: sonicAdapter.staking,
  },
};
