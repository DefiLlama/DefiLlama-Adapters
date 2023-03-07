const sdk = require("@defillama/sdk");
const abiCellarV0816 = require("./cellar-v0-8-16.json");

const chain = "ethereum";

// type Options = {
//   cellars: string[], // list of cellar addresses
//   balances: Object, // balances object to accumulate protocol TVL
//   chainBlocks, // provided by DefiLlama SDK
// }
async function sumTvl(options) {
  const { balances, cellars, chainBlocks } = options;

  // TVL is the value of each of the Cellar's positions summed up

  // Get the Cellar's postions (ERC20 addresses) as an array to construct
  // a list of balanceOf calls.
  let balanceCalls = await Promise.all(
    cellars.map((cellar) => getCellarBalanceCalls(cellar, options))
  );
  balanceCalls = balanceCalls.flat();

  // Call balanceOf for all positions across all Cellars using multicall
  const balanceResult = await sdk.api.abi.multiCall({
    calls: balanceCalls,
    abi: "erc20:balanceOf",
    block: chainBlocks[chain],
  });

  // Log the balances
  sdk.util.sumMultiBalanceOf(balances, balanceResult);
}

// target: string, cellar contract address
// options: same as above
//
// returns a list of balanceOf(address) parameters
// [{ target: erc20 contract address, params: [cellarAddress] }]
async function getCellarBalanceCalls(cellarAddress, options) {
  const { chainBlocks } = options;

  // Get a list of the Cellars positions as ERC20 contract addresses
  const positions = (
    await sdk.api.abi.call({
      chain,
      abi: abiCellarV0816.getPositions,
      target: cellarAddress,
      block: chainBlocks[chain],
    })
  ).output;

  // Construct a list of balanceOf calls
  return positions.map((position) => ({
    target: position,
    params: [cellarAddress], // Cellar holds the balance
  }));
}

module.exports = {
  sumTvl,
};
