const sdk = require("@defillama/sdk");
const abi = require("./abi.json");

//DCA Factory
const factoryAddress = "0xaC4a40a995f236E081424D966F1dFE014Fe0e98A";

//Helper for ABI calls
async function abiCall(target, abi, block) {
  let result = await sdk.api.abi.call({
    target: target,
    abi: abi,
    block: block,
  });
  return result;
}

async function ethTvl(timestamp, block) {
  const balances = {};
  //Gets all pairs
  const pairCall = await abiCall(factoryAddress, abi["allPairs"], block);

  const pairs = pairCall.output;

  //Calls for tokens in pair and balances of them then adds to balance
  for (let i = 0; i < pairs.length; i++) {
    const pool = pairs[i];
    const token1 = (await abiCall(pool, abi["tokenA"], block)).output;
    const token2 = (await abiCall(pool, abi["tokenB"], block)).output;
    const poolBalances = (await abiCall(pool, abi["availableToBorrow"], block)).output;
    const token1Balance = poolBalances[0];
    const token2Balance = poolBalances[1];
    sdk.util.sumSingleBalance(balances, token1, token1Balance);
    sdk.util.sumSingleBalance(balances, token2, token2Balance);
  }

  return balances;
}

module.exports = {
  ethereum: {
    tvl: ethTvl
  },
  tvl: sdk.util.sumChainTvls([ethTvl])
};
