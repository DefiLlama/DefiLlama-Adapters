const sdk = require("@defillama/sdk");
const fantomYields = require("./fantom-yields");
const { routerAbi } = require("./router-abi");

const supportedChains = ["fantom"];

async function getTotalBalance(balances, fyields, chainBlocks, transform) {
  for (const fyield of fyields) {
    await getBalance(balances, fyield, chainBlocks, transform);
  }
}

async function getBalance(balances, fyield, chainBlocks, transform) {
  const collateralBalance = (
    await sdk.api.abi.call({
      abi: routerAbi,
      chain: fyield.chain,
      target: fyield.router,
      params: [fyield.yieldBearingAsset, fyield.yieldProxy],
      block: chainBlocks[fyield.chain],
    })
  ).output;
  sdk.util.sumSingleBalance(
    balances,
    transform(fyield.yieldBearingAsset),
    collateralBalance
  );
}

async function getBalanceIn(chainBlocks, balances, chainName) {
  if (chainName == "fantom") {
    const transform = i => `fantom:${i}`;
    const { fyields } = fantomYields;
    await getTotalBalance(balances, fyields, chainBlocks, transform);
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
      methodology:
    "Accross different vaults, counts the total number of assets accumulated on each of them",
  fantom: {
    tvl,
  },
};
