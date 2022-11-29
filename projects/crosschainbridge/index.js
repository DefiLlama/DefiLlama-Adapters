const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");

const getBridgeContract = (chain) => {
  switch (chain) {
    case 'avax':
      return '0x46325c7005F04900F8D74cD0eAB903597b6EFFFF';
    default:
      return '0xCBCe172d7af2616804ab5b2494102dAeC47B2635';
  }
}

const getRewardPools = (chain) => {
  switch (chain) {
    case 'avax':
      return '0xbAb537b7AE2Fcb00eeA7e91Fa4782EEbaD3B6d10';
    case 'fantom':
      return '0x6eBC0D4Ae955218195E6D016Fb9D4358Ee34d1F9';
    default:
      return '0x0BDC1f983bC82B8F6F6BCcbF9810A9cdC1FE455f';
  }
}

/*
 * TOKEN CONFIGURATION
 * ADD TOKENS AND NETWORKS HERE
 */

const tokens = {
  ethereum: {
    // Project tokens
    TXL: "0x8eEF5a82E6Aa222a60F009ac18c24EE12dBf4b41",
    BRIDGE: "0x92868a5255c628da08f550a858a802f5351c5223",
    // Stablecoins
    BUSD: "0x4Fabb145d64652a948d72533023f6E7A623C7C53",
    DAI: "0x6b175474e89094c44da98b954eedeac495271d0f",
    USDC: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    USDT: "0xdac17f958d2ee523a2206206994597c13d831ec7",
    // Network Tokens
    WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    WMATIC: "0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0",
    // Further tokens
    BULK: "0xa143ac515dca260a46c742c7251ef3b268639593",
    DAX: "0x77e9618179820961ee99a988983bc9ab41ff3112",
    GFX: "0x65ad6a2288b2dd23e466226397c8f5d1794e58fc",
    ISLAND: "0xa0dc5132c91ea4d94fcf1727c32cc5a303b34cfc",
    MNY: "0xA6F7645ed967FAF708A614a2fcA8D4790138586f",
    PMON: "0x1796ae0b0fa4862485106a0de9b654efe301d0b2",
    REALM: "0x464FdB8AFFC9bac185A7393fd4298137866DCFB8",
    UCT: "0x6d1DC3928604b00180Bb570BdAe94b9698d33b79",
    UNO: "0x474021845c4643113458ea4414bdb7fb74a01a77",
    UPR: "0xf720e38f678b29b243f7d53b56acbf5de98f2385",
    ZENIQ: "0x5b52bfb8062ce664d74bbcd4cd6dc7df53fd7233",
  },
  bsc: {
    // Project tokens
    TXL: "0x1ffd0b47127fdd4097e54521c9e2c7f0d66aafc5",
    BRIDGE: "0x92868a5255c628da08f550a858a802f5351c5223",
    // Stablecoins
    BUSD: "0xe9e7cea3dedca5984780bafc599bd69add087d56",
    DAI: "0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3",
    USDC: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
    USDT: "0x55d398326f99059fF775485246999027B3197955",
    // Network Tokens
    WETH: "0x2170ed0880ac9a755fd29b2688956bd959f933f8",
    WMATIC: "0xcc42724c6683b7e57334c4e856f4c9965ed682bd",
    // Further tokens
    ARNX: "0x0c37bcf456bc661c14d596683325623076d7e283",
    BRKL: "0x66cafcf6c32315623c7ffd3f2ff690aa36ebed38",
    BULK: "0xa143ac515dca260a46c742c7251ef3b268639593",
    DAF: "0x8fb1a59ca2d57b51e5971a85277efe72c4492983",
    DAX: "0x2cb34f6a300813da9312b84ab566b2e51cc02921",
    GFX: "0x65ad6a2288b2dd23e466226397c8f5d1794e58fc",
    HAKA: "0xd85ad783cc94bd04196a13dc042a3054a9b52210",
    ISLAND: "0xa0dc5132c91ea4d94fcf1727c32cc5a303b34cfc",
    MNY: "0xA6F7645ed967FAF708A614a2fcA8D4790138586f",
    PMON: "0x1796ae0b0fa4862485106a0de9b654efe301d0b2",
    RACA: "0x12bb890508c125661e03b09ec06e404bc9289040",
    REALM: "0x464FdB8AFFC9bac185A7393fd4298137866DCFB8",
    UCT: "0x6d1dc3928604b00180bb570bdae94b9698d33b79",
    UNO: "0x474021845C4643113458ea4414bdb7fB74A01A77",
    ULTI: "0x42BFE4A3E023f2C90aEBFfbd9B667599Fa38514F",
    UPR: "0xf720e38f678b29b243f7d53b56acbf5de98f2385",
    TRON: "0x85eac5ac2f758618dfa09bdbe0cf174e7d574d5b",
    ZENIQ: "0x5b52bfb8062ce664d74bbcd4cd6dc7df53fd7233",
  },
  polygon: {
    // Project tokens
    TXL: "0x8eEF5a82E6Aa222a60F009ac18c24EE12dBf4b41",
    BRIDGE: "0x92868a5255c628da08f550a858a802f5351c5223",
    // Stablecoins
    BUSD: "0xdab529f40e671a1d4bf91361c21bf9f0c9712ab7",
    DAI: "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063",
    USDC: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
    USDT: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
    // Network Tokens
    WETH: "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619",
    WMATIC: "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
    // Further tokens
    DAF: "0x2f0e07e881363bb1cdff32971b2f8c87ef8ff432",
    GFX: "0x65ad6a2288b2dd23e466226397c8f5d1794e58fc",
    PMON: "0x1796ae0b0fa4862485106a0de9b654efe301d0b2",
    ULTI: "0xa6516f07c5fc7169fca3149b188c37ca617f1d41",
  },
  avax: {
    // Project tokens
    BRIDGE: "0xC0367f9b1f84Ca8DE127226AC2A994EA4bf1e41b",
    // Stablecoins
    USDC: "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664",
    USDT: "0xc7198437980c041c805a1edcba50c1ce5db95118",
    // Network Tokens
    WETH: "0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab",
  },
  fantom: {
    // Project tokens
    BRIDGE: "0x92868A5255C628dA08F550a858A802f5351C5223",
    // Stablecoins
    USDC: "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75",
    USDT: "0x049d68029688eabf473097a2fc38ef61633a3c7a",
    // Network Tokens
    WETH: "0x74b23882a30290451A17c44f4F05243b6b58C76d",
  }
};

/*
 * END OF CONFIGURATION
 */

const getAddrPrefix = (chain) => (chain === "ethereum" ? "" : `${chain}:`);

const createTvlFunction = (chain) => async (timestamp, block, chainBlocks) => {
  const balances = {};
  const bridgeContract = getBridgeContract(chain);

  for (const [symbol, address] of Object.entries(tokens[chain])) {
    let tokenBalance = BigNumber(0);
    // Get balance of token in bridge contract
    const result = await sdk.api.erc20.balanceOf({
      target: address,
      owner: bridgeContract,
      chain,
      block: chainBlocks[chain],
    });
    tokenBalance = tokenBalance.plus(result.output);

    balances[`${getAddrPrefix(chain)}${address}`] = tokenBalance.toFixed();
  }
  return balances;
};

const createRewardPoolsTvlFunction = (chain) => async (timestamp, block, chainBlocks) => {
  const bridgeTokenAddress = tokens[chain].BRIDGE;
  const rewardPoolsContract = getRewardPools(chain);

  if (!bridgeTokenAddress) return 0;

  let tokenBalance = BigNumber(0);

  const resultRewardPools = await sdk.api.erc20.balanceOf({
    target: bridgeTokenAddress,
    owner: rewardPoolsContract,
    chain,
    block: chainBlocks[chain],
  });
  tokenBalance = tokenBalance.plus(resultRewardPools.output);

  return { [`${getAddrPrefix(chain)}${bridgeTokenAddress}`] : tokenBalance.toFixed() };
};

const toExport = {};
for (const network of Object.keys(tokens)) {
  toExport[network] = {
    tvl: createTvlFunction(network),
    staking: createRewardPoolsTvlFunction(network),
  };
}

module.exports = toExport;
// node test.js projects/crosschainbridge/index.js