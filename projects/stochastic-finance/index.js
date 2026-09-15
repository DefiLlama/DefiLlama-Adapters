const SFSwapV0Factory = "0xcE23F95A0aC4B28B4eb2D7697aBD3c87EE03fc90";
const StochasticOptions = "0x473b5c9f831Af8cB5B379eB3Ab8f9806E9A0470C";
const USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

async function tvl(api) {
  const pairs = await api.fetchList({
    target: SFSwapV0Factory,
    fromBlock: 51260103,
    lengthAbi: "allPairsLength",
    itemAbi: "allPairs",
  });

  const tokensAndOwners = pairs.map(pair => [USDC, pair]);
  tokensAndOwners.push([USDC, StochasticOptions]);

  return api.sumTokens({ tokensAndOwners });
}

module.exports = {
  methodology:
    "TVL is the USDC collateral backing issued options held in the StochasticOptions contract plus the USDC reserves of every pair created by the SFSwapV0Factory.",
  start: "2026-09-13",
  base: { tvl },
};