const abi = {
  "getOracle": "function getOracle(address token) external view returns (address)",
  "latestAnswer": "function latestAnswer() external view override returns (int256)"
}

// TODO: instead of hardcoding the contract addresses, pull the list from the events
// of the factory contract that deploys them. Like this we won't need a new PR for each
// new project tokenized
const tokens = [
  "0x35b5129e86EBE5Fd00b7DbE99aa202BE5CF5FA04", // Champfleury Contract ( vision87.com )
].map(i => i.toLowerCase())


// `api` is an injected `sdk.ChainApi` object with which you can interact with
// a given chain through `call/multiCall/batchCall` method based on your need,
// also stores tvl balances
async function tvl(api) {

  const supplies = await api.multiCall({ abi: 'erc20:totalSupply', calls: tokens })

  supplies.forEach((supply, i) => {
    api.add(tokens[i], supply)
  });

  return api.getBalances()
}

const chains = ["base"]

chains.forEach(chain => {
  module.exports[chain] = {
    tvl
  }
})

