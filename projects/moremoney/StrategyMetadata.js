const sdk = require("@defillama/sdk");
const StrategyViewer = require("./StrategyViewer.json");
const addresses = require("./addresses.json");
const chain = 'avax'

async function useStrategyMetadata(block) {
  const curAddresses = addresses.avax;

  const token2Strat = {
    ["0xE5e9d67e93aD363a50cABCB9E931279251bBEFd0"]:
      curAddresses.YieldYakStrategy2,
    ["0x152b9d0FdC40C096757F570A51E494bd4b943E50"]:
      curAddresses.YieldYakStrategy2,
    ["0x2b2C81e08f1Af8835a78Bb2A90AE924ACE0eA4bE"]:
      curAddresses.YieldYakStrategy2,
    ["0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7"]:
      curAddresses.YieldYakAVAXStrategy2,
    ["0x9e295B5B976a184B14aD8cd72413aD846C299660"]:
      curAddresses.YieldYakPermissiveStrategy2,
    ["0xF7D9281e8e363584973F946201b82ba72C965D27"]:
      curAddresses.SimpleHoldingStrategy,
  };
  const tokens = Object.keys(token2Strat);
  const strats = Object.values(token2Strat);

  tokens.push("0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7");
  strats.push(curAddresses.AltYieldYakAVAXStrategy2);
  tokens.push("0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7");
  strats.push(curAddresses.OldYieldYakAVAXStrategy2);
  tokens.push("0x152b9d0FdC40C096757F570A51E494bd4b943E50");
  strats.push(curAddresses.AltYieldYakStrategy2);
  tokens.push("0x2b2C81e08f1Af8835a78Bb2A90AE924ACE0eA4bE");
  strats.push(curAddresses.AltYieldYakStrategy2);
  tokens.push("0xF7D9281e8e363584973F946201b82ba72C965D27");
  strats.push(curAddresses.YieldYakStrategy2);

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
    ["0x6e84a6216ea6dacc71ee8e6b0a5b7322eebc0fdd"]:
      curAddresses.YieldYakStrategy,
    ["0xd586e7f844cea2f87f50152665bcbc2c279d8d70"]:
      curAddresses.YieldYakStrategy,
    ["0x8729438EB15e2C8B576fCc6AeCdA6A148776C0F5"]:
      curAddresses.YieldYakStrategy,
    ["0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664"]:
      curAddresses.YieldYakStrategy,
    ["0xA389f9430876455C36478DeEa9769B7Ca4E3DDB1"]:
      curAddresses.YieldYakStrategy,
    ["0xeD8CBD9F0cE3C6986b22002F03c6475CEb7a6256"]:
      curAddresses.YieldYakStrategy,
    ["0x454E67025631C065d3cFAD6d71E6892f74487a15"]:
      curAddresses.TraderJoeMasterChefStrategy,
    ["0x2148D1B21Faa7eb251789a51B404fc063cA6AAd6"]:
      curAddresses.SimpleHoldingStrategy,
    ["0xCDFD91eEa657cc2701117fe9711C9a4F61FEED23"]:
      curAddresses.MultiTraderJoeMasterChef3Strategy,
  };
  // const masterChef2Tokens = [
  //   '0x57319d41f71e81f3c65f2a47ca4e001ebafd4f33',
  //   '0xa389f9430876455c36478deea9769b7ca4e3ddb1',
  //   '0xed8cbd9f0ce3c6986b22002f03c6475ceb7a6256',
  // ].map(getAddress);

  const legacyTokens = Object.keys(legacyToken2Strat);
  const legacyStrats = Object.values(legacyToken2Strat);

  //legacy
  legacyTokens.push("0x454E67025631C065d3cFAD6d71E6892f74487a15");
  legacyStrats.push(curAddresses.YieldYakStrategy);
  legacyTokens.push("0x6e84a6216eA6dACC71eE8E6b0a5B7322EEbC0fDd");
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
