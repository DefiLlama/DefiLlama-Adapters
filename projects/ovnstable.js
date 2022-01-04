const sdk = require("@defillama/sdk");
const { getBlock } = require("./helper/getBlock");
const { transformPolygonAddress } = require("./helper/portedTokens");

const holder = "0x5413e22E6cb029c0C4b289600c97960D0aeF940c";

const crvTokens = [
  "0xE7a24EF0C5e95Ffb0f6684b813A78F2a3AD7D171", // lp
  "0x19793B454D3AfC7b454F206Ffe95aDE26cA6912c", // reward
  "0x445FE580eF8d70FF569aB36e80c647af338db351", // holder
];

const underlying = [
  "0x1a13f4ca1d028320a707d99520abfefca3998b7f", // amUSDC
  "0x27f8d03b3a2196956ed754badc28d73be8830a6e", // DAI
  "0x60d55f02a771d515e077c9c2403a1ef324885cec", // USDT
  "0x172370d5cd63279efa6d502dab29171933a610af", // CRV
  "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270", // wMATIC
  "0x2791bca1f2de4661ed88a30c99a7a9449aa84174", // USDC
];

async function tvl(timestamp, block, chainBlocks) {
  block = await getBlock(timestamp, "polygon", chainBlocks);
  let balances = {};
  const transformAddress = await transformPolygonAddress();

  const holderBalances = (
    await sdk.api.abi.multiCall({
      calls: crvTokens.map((token) => ({
        target: token,
        params: [holder],
      })),
      abi: "erc20:balanceOf",
      block,
      chain: "polygon",
    })
  ).output;

  const totalSupplies = (
    await sdk.api.abi.multiCall({
      calls: crvTokens.map((token) => ({
        target: token,
      })),
      abi: "erc20:totalSupply",
      block,
      chain: "polygon",
    })
  ).output;

  const underlyingBalances = (
    await sdk.api.abi.multiCall({
      calls: underlying.map((token) => ({
        target: token,
        params: [crvTokens[2]],
      })),
      abi: "erc20:balanceOf",
      block,
      chain: "polygon",
    })
  ).output;

  const rewardBalances = (
    await sdk.api.abi.multiCall({
      calls: underlying.map((token) => ({
        target: token,
        params: [crvTokens[1]],
      })),
      abi: "erc20:balanceOf",
      block,
      chain: "polygon",
    })
  ).output;

  for (let i = 0; i < underlying.length; i++) {
    if (underlyingBalances[i].output > 0) {
      const holderBalance =
        underlyingBalances[i].output *
        (holderBalances[0].output / totalSupplies[0].output +
          holderBalances[1].output / totalSupplies[1].output);
      sdk.util.sumSingleBalance(
        balances,
        transformAddress(underlying[i]),
        holderBalance
      );
    }

    if (rewardBalances[i].output > 0) {
      const rewardBalance =
        rewardBalances[i].output *
        (holderBalances[1].output / totalSupplies[1].output);
      sdk.util.sumSingleBalance(
        balances,
        transformAddress(underlying[i]),
        rewardBalance
      );
    }
  }

  const usdcBalance = (
    await sdk.api.abi.call({
      target: underlying[5],
      params: [holder],
      abi: "erc20:balanceOf",
      chain: "polygon",
      block,
    })
  ).output;
  sdk.util.sumSingleBalance(
    balances,
    transformAddress(underlying[5]),
    Number(usdcBalance)
  );

  const amUsdcBalance = (
    await sdk.api.abi.call({
      target: underlying[0],
      params: [holder],
      abi: "erc20:balanceOf",
      chain: "polygon",
      block,
    })
  ).output;

  sdk.util.sumSingleBalance(
    balances,
    transformAddress(underlying[0]),
    Number(amUsdcBalance)
  );

  return balances;
}

module.exports = {
  polygon: {
    tvl,
  },
};
