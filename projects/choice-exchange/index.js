const sdk = require("@defillama/sdk");
const { getLogs2 } = require("../helper/cache/getLogs");
const { getFactoryTvl } = require("../terraswap/factoryTvl");

// v1: terraswap-style CosmWasm factory on Injective
const v1Factory = "inj1k9lcqtn3y92h4t3tdsu7z8qx292mhxhgsssmxg";

// v2: an Infinity (Uniswap v4 style) fork on Injective EVM (chain id 1776).
// Both pool managers custody every pool's tokens in the one singleton Vault, so
// TVL is the Vault's balance of every currency a pool was ever opened with.
// Addresses: https://github.com/choice-exchange/choice_v2_contracts/blob/main/deployments/injective_mainnet.json
const v2 = {
  vault: "0xB67dd13b30ed21310be170968301eF83827B1Cad",
  poolManagers: [
    {
      target: "0x6A4085Bb379e5213Df84Dc2dD52562559602b029", // CLPoolManager
      fromBlock: 182158326,
      eventAbi:
        "event Initialize(bytes32 indexed id, address indexed currency0, address indexed currency1, address hooks, uint24 fee, bytes32 parameters, uint160 sqrtPriceX96, int24 tick)",
    },
    {
      target: "0xfc6dd227f928Bf3396ff38Da00e19718f9CE7d7e", // BinPoolManager
      fromBlock: 182158543,
      eventAbi:
        "event Initialize(bytes32 indexed id, address indexed currency0, address indexed currency1, address hooks, uint24 fee, bytes32 parameters, uint24 activeId)",
    },
  ],
};

async function v2Tvl(api) {
  // `injective` is registered as both a cosmos and an EVM chain, and the sdk resolves
  // its block over the cosmos lcd. Same workaround as projects/pumex
  if (!api.block) api.block = (await api.provider.getBlockNumber()) - 20;

  const tokens = new Set();
  for (const { target, fromBlock, eventAbi } of v2.poolManagers) {
    const logs = await getLogs2({ api, target, fromBlock, eventAbi });
    logs.forEach((log) => {
      tokens.add(String(log.currency0).toLowerCase());
      tokens.add(String(log.currency1).toLowerCase());
    });
  }

  await api.sumTokens({ owner: v2.vault, tokens: [...tokens], permitFailure: true });
}

async function tvl(api) {
  // kept apart as a precaution: v1 prices its pairs off their own reserve ratios,
  // and that pass walks every balance on the api it is handed, not just the ones it
  // put there. The two eras do not share an address namespace today, so nothing is
  // observably wrong with sharing one api - this just keeps it that way.
  const v1Api = new sdk.ChainApi({ chain: api.chain });
  const v2Api = new sdk.ChainApi({ chain: api.chain });

  await getFactoryTvl(v1Factory)(v1Api);
  await v2Tvl(v2Api);

  api.addBalances(v1Api.getBalances());
  api.addBalances(v2Api.getBalances());
}

module.exports = {
  misrepresentedTokens: true,
  // v2 reads at the current EVM height, since the block for a timestamp cannot be
  // resolved on this chain - see v2Tvl
  timetravel: false,
  methodology: "Liquidity on the DEX: the CosmWasm (v1) pair contracts' reserves, plus the tokens the Infinity (v2) singleton Vault holds on Injective EVM, in every currency a pool was opened with.",
  injective: { tvl },
};
