const sdk = require("@defillama/sdk");
const { transformFantomAddress } = require("../helper/portedTokens");
const fantomYields = require("./fantom-yields");
const { routerAbi } = require("./router-abi");

const supportedChains = ["fantom"];

async function getTotalBalance(balances, yields, chainBlocks, transform) {
  for (const yield of yields) {
    await getBalance(balances, yield, chainBlocks, transform);
  }
}

async function getBalance(balances, yield, chainBlocks, transform) {
  const collateralBalance = (
    await sdk.api.abi.call({
      abi: routerAbi,
      chain: yield.chain,
      target: yield.router,
      params: [yield.yieldBearingAsset, yield.yieldProxy],
      block: chainBlocks[yield.chain],
    })
  ).output;
  await sdk.util.sumSingleBalance(
    balances,
    transform(yield.yieldBearingAsset),
    collateralBalance
  );
}

async function getBalanceIn(chainBlocks, balances, chainName) {
  if (chainName == "fantom") {
    const transform = await transformFantomAddress();
    const { yields } = fantomYields;
    await getTotalBalance(balances, yields, chainBlocks, transform);
  }
}

async function tvl(timestamp, block, chainBlocks) {
  const balances = {};
  for (const chainName of supportedChains) {
    await getBalanceIn(chainBlocks, balances, chainName);
  }
  return balances;
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology:
    "Accross different vaults, counts the total number of assets accumulated on each of them",
  start: 33000000,
  fantom: {
    tvl,
  },
};
