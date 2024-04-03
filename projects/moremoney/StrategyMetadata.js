const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const StrategyViewer = require("./StrategyViewer.json");
const addresses = require("./addresses.json");
const chain = 'avax'

async function useStrategyMetadata(block) {
  const curAddresses = addresses.avax;

  const token2Strat = {
    ["0xE5e9d67e93aD363a50cABCB9E931279251bBEFd0"]:
      curAddresses.YieldYakStrategy2,
    [ADDRESSES.avax.BTC_b]:
      curAddresses.YieldYakStrategy2,
    [ADDRESSES.avax.SAVAX]:
      curAddresses.YieldYakStrategy2,
    [ADDRESSES.avax.WAVAX]:
      curAddresses.YieldYakAVAXStrategy2,
    ["0x9e295B5B976a184B14aD8cd72413aD846C299660"]:
      curAddresses.YieldYakPermissiveStrategy2,
    ["0xF7D9281e8e363584973F946201b82ba72C965D27"]:
      curAddresses.SimpleHoldingStrategy,
  };
  const tokens = Object.keys(token2Strat);
  const strats = Object.values(token2Strat);

  tokens.push(ADDRESSES.avax.WAVAX);
  strats.push(curAddresses.AltYieldYakAVAXStrategy2);
  tokens.push(ADDRESSES.avax.WAVAX);
  strats.push(curAddresses.OldYieldYakAVAXStrategy2);
  // tokens.push(ADDRESSES.avax.BTC_b);
  // strats.push(curAddresses.AltYieldYakStrategy2);
  // tokens.push(ADDRESSES.avax.SAVAX);
  // strats.push(curAddresses.AltYieldYakStrategy2);
  // tokens.push("0xF7D9281e8e363584973F946201b82ba72C965D27");
  // strats.push(curAddresses.YieldYakStrategy2);

  const stratViewer = await sdk.api.abi.call({
    target: curAddresses.StrategyViewer,
    abi: StrategyViewer.abi,
    chain, block,
    params: [curAddresses.StableLending2, tokens, strats],
  });
  return stratViewer.output;
}

async function useLegacyIsolatedStrategyMetadata(block) {
  const curAddresses = addresses.avax;

  //legacy
  const legacyToken2Strat = {
    ["0x60781C2586D68229fde47564546784ab3fACA982"]:
      curAddresses.YieldYakStrategy,
    ["0x59414b3089ce2AF0010e7523Dea7E2b35d776ec7"]:
      curAddresses.YieldYakStrategy,
    [ADDRESSES.avax.JOE]:
      curAddresses.YieldYakStrategy,
    [ADDRESSES.avax.DAI]:
      curAddresses.YieldYakStrategy,
    ["0x8729438EB15e2C8B576fCc6AeCdA6A148776C0F5"]:
      curAddresses.YieldYakStrategy,
    [ADDRESSES.avax.USDC_e]:
      curAddresses.YieldYakStrategy,
    ["0xA389f9430876455C36478DeEa9769B7Ca4E3DDB1"]:
      curAddresses.YieldYakStrategy,
    ["0xeD8CBD9F0cE3C6986b22002F03c6475CEb7a6256"]:
      curAddresses.YieldYakStrategy,
    ["0x2148D1B21Faa7eb251789a51B404fc063cA6AAd6"]:
      curAddresses.SimpleHoldingStrategy,
    /*["0x454E67025631C065d3cFAD6d71E6892f74487a15"]:
      curAddresses.TraderJoeMasterChefStrategy,
    ["0xCDFD91eEa657cc2701117fe9711C9a4F61FEED23"]:
      curAddresses.MultiTraderJoeMasterChef3Strategy, */
  };
  // const masterChef2Tokens = [
  //   ADDRESSES.avax.xJOE,
  //   '0xa389f9430876455c36478deea9769b7ca4e3ddb1',
  //   '0xed8cbd9f0ce3c6986b22002f03c6475ceb7a6256',
  // ].map(getAddress);

  const legacyTokens = Object.keys(legacyToken2Strat);
  const legacyStrats = Object.values(legacyToken2Strat);

  //legacy
  legacyTokens.push("0x454E67025631C065d3cFAD6d71E6892f74487a15");
  legacyStrats.push(curAddresses.YieldYakStrategy);
  legacyTokens.push(ADDRESSES.avax.JOE);
  legacyStrats.push(curAddresses.sJoeStrategy);

  const stratViewer = await sdk.api.abi.call({
    target: curAddresses.LegacyStrategyViewer,
    abi: StrategyViewer.abi,
    chain, block,
    params: [curAddresses.StableLending, legacyTokens, legacyStrats],
  });

  return stratViewer.output;
}

module.exports = {
  useStrategyMetadata: useStrategyMetadata,
  useLegacyIsolatedStrategyMetadata: useLegacyIsolatedStrategyMetadata,
};
