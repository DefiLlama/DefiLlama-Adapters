const sdk = require("@defillama/sdk");
const abi = {
    "want": "address:want",
    "balanceOf": "uint256:balanceOf",
    "vaults": "function vaults(address) view returns (address)",
    "balance": "uint256:balance"
  };

const controllerV1 = "0x71908d6faA4c4Ae8717bCe5839b805cC807Ba302";
const controllerV2 = "0xF3CbD482Dd5Ac5aB9A0FF9baa68DdaD2f08B1c2f";

const strategiesContractsV1 = [
  // strategy DAI V1
  "0x1534A23d885C5a78607CFE1C1AC40669C8b79DB7",
  // strategy USDC V1
  "0xCEb3b75e0e3B4EAD10a959753e3Def4F7D93D383",
  // strategy USDT V1
  "0x5B8fCD142617E790038491E30eE8CE68c3B1EDE2",
];

const strategiesContractsV2 = [
  // strategy DAI V2
  "0x87E2Bb2f2695c7EAFb02Fd7dB1a4EF7d7B179C4E",
  // strategy USDC V2
  "0xe68a4365D3Bdeed31F0dF6dAD633bCb1CEF322d8",
  // strategy USDT V2
  "0x898fEbAba28b945dc432fcAa897FD9231a1FeD9d",
];

async function calcTvl(balances, strategiesContracts, controller) {
  const wants = (
    await sdk.api.abi.multiCall({
      abi: abi.want,
      calls: strategiesContracts.map((strat) => ({
        target: strat,
      })),
    })
  ).output.map((token) => token.output);

  const balanceStrategy = (
    await sdk.api.abi.multiCall({
      abi: abi.balanceOf,
      calls: strategiesContracts.map((strat) => ({
        target: strat,
      })),
    })
  ).output.map((bal) => bal.output);

  const vaults = (
    await sdk.api.abi.multiCall({
      abi: abi.vaults,
      calls: wants.map((want) => ({
        target: controller,
        params: want,
      })),
    })
  ).output.map((vault) => vault.output);

  const vaultBalance = (
    await sdk.api.abi.multiCall({
      abi: abi.balance,
      calls: vaults.map((vault) => ({
        target: vault,
      })),
    })
  ).output.map((bal) => bal.output);

  wants.forEach((token, idx) => {
    sdk.util.sumSingleBalance(balances, token, balanceStrategy[idx]);
    sdk.util.sumSingleBalance(balances, token, vaultBalance[idx]);
  });
}

async function ethTvl() {
  const balances = {};

  /*** Version 1 ***/
  await calcTvl(balances, strategiesContractsV1, controllerV1);
  /*** Version 2 ***/
  await calcTvl(balances, strategiesContractsV2, controllerV2);

  return balances;
}

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    tvl: ethTvl,
  },
  methodology:
    "Counts liquidty on the Vaults trouggh Controller Contracts",
};
