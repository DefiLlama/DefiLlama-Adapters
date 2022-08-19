const sdk = require("@defillama/sdk");
const { transformArbitrumAddress } = require("../helper/portedTokens");
const { sumTokens2 } = require("../helper/unwrapLPs");
const Vault = require("./Vault.json");
const Pools = require("./Pools.json");

const VAULT_ADDRESS = "0xDfbA8AD57d2c62F61F0a60B2C508bCdeb182f855";
const USDC = "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8";

async function tvl(timestamp, mainnetBlock, chainBlocks) {
  const chain = "arbitrum";
  const block = chainBlocks[chain];

  const swapsTokens = await getSwapsTokens(chain, block);
  const poolsAddresses = await getPoolsAddresses(chain, block);

  return sumTokens2({
    owners: [...poolsAddresses, VAULT_ADDRESS],
    tokens: [...swapsTokens, USDC],
    chain,
    block,
  });
}

async function getSwapsTokens(chain, block) {
  const { output: numTokens } = await sdk.api.abi.call({
    target: VAULT_ADDRESS,
    abi: Vault.allWhitelistedTokensLength,
    chain,
    block,
  });

  const { output: swapsTokens } = await sdk.api.abi.multiCall({
    abi: Vault.allWhitelistedTokens,
    calls: Array.apply(null, { length: numTokens }).map((_, i) => ({
      target: VAULT_ADDRESS,
      params: [i],
    })),
    chain,
    block,
  });

  return swapsTokens.map((i) => i.output);
}

const factoryPoolContractsConfig = [
  {
    fromBlock: 1009749,
    contract: "0x98C58c1cEb01E198F8356763d5CbA8EB7b11e4E2",
  },
  {
    fromBlock: 13387522,
    contract: "0x3Feafee6b12C8d2E58c5B118e54C09F9273c6124",
  },
];

async function getPoolsAddresses(chain, block) {
  let factories = [];
  if (!block) {
    factories = factoryPoolContractsConfig.map((i) => i.contract);
  } else {
    factoryPoolContractsConfig
      .filter((i) => block > i.fromBlock)
      .forEach((i) => factories.push(i.contract));
  }
  const { output: numPools } = await sdk.api.abi.multiCall({
    calls: factories.map((i) => ({ target: i })),
    abi: Pools.numPools,
    chain,
    block,
  });

  const calls = [];
  numPools.forEach((i) => {
    for (let j = 0; j < +i.output; j++)
      calls.push({ target: i.input.target, params: j });
  });

  const { output: pools } = await sdk.api.abi.multiCall({
    abi: Pools.pools,
    calls,
    chain,
    block,
  });
  return pools.map((i) => i.output);
}

module.exports = {
  arbitrum: {
    tvl,
  },
};