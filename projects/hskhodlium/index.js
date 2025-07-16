const sdk = require('@defillama/sdk');

const HSK_CHAIN = "hsk";
const HSK_WRAPPED_TOKEN = "0xB210D2120d57b758EE163cFfb43e73728c471Cf1".toLowerCase(); 
const STAKING_CONTRACT = "0xd30a4ca3b40ea4ff00e81b0471750aa9a94ce9b1"; 

async function tvl() {
  const stakingBalance = await sdk.api.eth.getBalance({
    target: STAKING_CONTRACT,
    chain: HSK_CHAIN,
  });

  return {
    [`${HSK_CHAIN}:${HSK_WRAPPED_TOKEN}`]: stakingBalance.output,
  };
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: false,
  methodology: "TVL includes all native HSK tokens staked at the main contract on HashKey Chain. Token price is derived from its Ethereum-wrapped version.",
  [HSK_CHAIN]: {
    tvl,
  },
};

