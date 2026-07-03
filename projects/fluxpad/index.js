const { nullAddress } = require('../helper/unwrapLPs');

// Fluxpad Factory Addresses
const CONTRACTS = {
  alvey: {
    factoryV1: '0xCe025C574C6AD0f4F96B85D385Da2E31278E54D2',
    factoryV2: '0x586af47cb950C6Cb9960aBAb3fC1437df177417C',
    ausdt: '0x223Cb45fB37e9b927b0c1Fab58d4a1A819C0C4f6', // stable quote on Alvey
  },
  bitroot: {
    factoryV1: '0xF491b7cfb0b31D384b80F1949E0b3D6701D5794A',
  },
  robinhood: {
    // UPDATE THIS: Replace with your mainnet deployment address once live
    factoryV2: '0x0000000000000000000000000000000000000000',
  }
};

async function alvTvl(timestamp, block, chainBlocks, { api }) {
  return api.sumTokens({
    owners: [CONTRACTS.alvey.factoryV1, CONTRACTS.alvey.factoryV2],
    tokens: [nullAddress, CONTRACTS.alvey.ausdt]
  });
}

// Bitroot is not yet listed as a supported chain on DefiLlama. 
// Uncomment this and add "bitroot" to module.exports once the chain is registered.
/*
async function bitrootTvl(timestamp, block, chainBlocks, { api }) {
  return api.sumTokens({
    owners: [CONTRACTS.bitroot.factoryV1],
    tokens: [nullAddress]
  });
}
*/

async function robinhoodTvl(timestamp, block, chainBlocks, { api }) {
  const factory = CONTRACTS.robinhood.factoryV2;
  if (!factory || factory === '0x0000000000000000000000000000000000000000') {
    return {};
  }
  return api.sumTokens({
    owners: [factory],
    tokens: [nullAddress]
  });
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: "TVL is calculated by summing the native and quote token balances held as reserves inside the active Fluxpad factory contracts.",
  start: 1714692286, //  Timestamp of the first factory deployment (approx. 2026-05-02)
  alv: {
    tvl: alvTvl,
  },
  // bitroot: {
  //   tvl: bitrootTvl,
  // },
  robinhood: {
    tvl: robinhoodTvl,
  }
};
