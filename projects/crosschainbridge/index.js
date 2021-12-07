const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");

const BRIDGE_CONTRACT = "0xCBCe172d7af2616804ab5b2494102dAeC47B2635";
const REWARD_POOLS = "0x0BDC1f983bC82B8F6F6BCcbF9810A9cdC1FE455f";

/*
 * TOKEN CONFIGURATION
 * ADD TOKENS AND NETWORKS HERE
 */

const tokens = {
  ethereum: {
    TXL: "0x8eEF5a82E6Aa222a60F009ac18c24EE12dBf4b41",
    PMON: "0x1796ae0b0fa4862485106a0de9b654efe301d0b2",
    BULK: "0xa143ac515dca260a46c742c7251ef3b268639593",
    USDC: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    GFX: "0x65ad6a2288b2dd23e466226397c8f5d1794e58fc",
    UCT: "0x6d1DC3928604b00180Bb570BdAe94b9698d33b79",
    UPR: "0xf720e38f678b29b243f7d53b56acbf5de98f2385",
    UNO: "0x474021845c4643113458ea4414bdb7fb74a01a77",
    MATIC: "0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0",
    MNY: "0xA6F7645ed967FAF708A614a2fcA8D4790138586f",
    ISLAND: "0xa0dc5132c91ea4d94fcf1727c32cc5a303b34cfc",
    DAX: "0x77e9618179820961ee99a988983bc9ab41ff3112",
    ZENIQ: "0x5b52bfb8062ce664d74bbcd4cd6dc7df53fd7233",
    BRIDGE: "0x92868a5255c628da08f550a858a802f5351c5223",
  },
  bsc: {
    TXL: "0x1ffd0b47127fdd4097e54521c9e2c7f0d66aafc5",
    PMON: "0x1796ae0b0fa4862485106a0de9b654efe301d0b2",
    USDC: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
    GFX: "0x65ad6a2288b2dd23e466226397c8f5d1794e58fc",
    UNO: "0x474021845C4643113458ea4414bdb7fB74A01A77",
    ULTI: "0x42BFE4A3E023f2C90aEBFfbd9B667599Fa38514F",
    UCT: "0x6d1dc3928604b00180bb570bdae94b9698d33b79",
    BUSD: "0x55d398326f99059ff775485246999027b3197955",
    ARNX: "0x0c37bcf456bc661c14d596683325623076d7e283",
    RACA: "0x12bb890508c125661e03b09ec06e404bc9289040",
    BRKL: "0x66cafcf6c32315623c7ffd3f2ff690aa36ebed38",
    TRON: "0x85eac5ac2f758618dfa09bdbe0cf174e7d574d5b",
    MATIC: "0xcc42724c6683b7e57334c4e856f4c9965ed682bd",
    BRIDGE: "0x92868a5255c628da08f550a858a802f5351c5223",
    BULK: "0xa143ac515dca260a46c742c7251ef3b268639593",
    DAX: "0x2cb34f6a300813da9312b84ab566b2e51cc02921",
    HAKA: "0xd85ad783cc94bd04196a13dc042a3054a9b52210",
    ISLAND: "0xa0dc5132c91ea4d94fcf1727c32cc5a303b34cfc",
    MNY: "0xA6F7645ed967FAF708A614a2fcA8D4790138586f",
    UPR: "0xf720e38f678b29b243f7d53b56acbf5de98f2385",
    ZENIQ: "0x5b52bfb8062ce664d74bbcd4cd6dc7df53fd7233",
  },
  polygon: {
    TXL: "0x8eEF5a82E6Aa222a60F009ac18c24EE12dBf4b41",
    PMON: "0x1796ae0b0fa4862485106a0de9b654efe301d0b2",
    GFX: "0x65ad6a2288b2dd23e466226397c8f5d1794e58fc",
    USDC: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
    ULTI: "0xa6516f07c5fc7169fca3149b188c37ca617f1d41",
    USDT: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
    DAI: "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063",
    WETH: "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619",
    BRIDGE: "0x92868a5255c628da08f550a858a802f5351c5223",
  },
};

/*
 * END OF CONFIGURATION
 */

const getAddrPrefix = (chain) => (chain === "ethereum" ? "" : `${chain}:`);

const createTvlFunction = (chain) => async (timestamp, block) => {
  const balances = {};

  for (const [symbol, address] of Object.entries(tokens[chain])) {
    let tokenBalance = BigNumber(0);
    // Get balance of token in bridge contract
    const result = await sdk.api.erc20.balanceOf({
      target: address,
      owner: BRIDGE_CONTRACT,
      chain,
      block,
    });
    tokenBalance = tokenBalance.plus(result.output);

    // Also get balance of BRIDGE tokens in Reward Pools contract
    if (symbol === "BRIDGE") {
      const resultRewardPools = await sdk.api.erc20.balanceOf({
        target: address,
        owner: REWARD_POOLS,
        chain,
        block,
      });
      tokenBalance = tokenBalance.plus(resultRewardPools.output);
    }
    balances[`${getAddrPrefix(chain)}${address}`] = tokenBalance.toFixed();
  }
  return balances;
};

const toExport = {};
for (const network of Object.keys(tokens)) {
  toExport[network] = { tvl: createTvlFunction(network) };
}

module.exports = toExport;
