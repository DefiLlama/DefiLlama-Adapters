const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokens2 } = require("../helper/unwrapLPs");
const sdk = require("@defillama/sdk");

const optimismvault = "0x10235996C4DAbCE8430a71Cbc06571bd475A1d0C";

const Contracts = {
  optimismvault: "0x10235996C4DAbCE8430a71Cbc06571bd475A1d0C",
  Tokens: {
    WETH: "0xD158B0F013230659098e58b66b602dFF8f7ff120",
    WBTC: "0x68f180fcCe6836688e9084f035309E29Bf0A2095",
    USDC: ADDRESSES.optimism.USDC,
    USDT: ADDRESSES.optimism.USDT,
  },
};

async function tvl(_, _b, _cb, { api }) {
  let balances = {};

  let Weth_vault_balance = await api.call({
    abi: "erc20:balanceOf",
    target: Contracts.Tokens.WETH,
    params: [optimismvault],
  });

  await sdk.util.sumSingleBalance(
    balances,
    ADDRESSES.optimism.WETH,
    Weth_vault_balance,
    api.chain
  );

  return sumTokens2({
    balances: balances,
    api,
    owner: Contracts.optimismvault,
    tokens: Object.values(Contracts.Tokens),
  });
}

module.exports = {
  optimism: {
    tvl,
  },
};
