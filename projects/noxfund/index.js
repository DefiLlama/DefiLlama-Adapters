const { getBalance } = require("@defillama/sdk/build/eth");

const NOXFUND_CONTRACT = "0x433830E36585bdACC840E1caB419C4211bBf13f5";
const USDT_BSC = "0x55d398326f99059fF775485246999027B3197955";
const BSC_CHAIN = "bsc";

async function tvl(timestamp, ethBlock, chainBlocks) {
  const block = chainBlocks[BSC_CHAIN];
  
  const balances = await getBalance({
    target: USDT_BSC,
    owner: NOXFUND_CONTRACT,
    block: block,
    chain: BSC_CHAIN
  });

  return {
    [`${BSC_CHAIN}:${USDT_BSC}`]: balances.output
  };
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: "Counts the USDT balance held in the NoxFund contract as TVL. This represents locked user deposits available for payouts.",
  bsc: {
    tvl
  }
};
