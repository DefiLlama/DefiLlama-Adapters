const sdk = require("@defillama/sdk");
const { api } = require("@defillama/sdk");
const abi = require("./abi.json");

const VAULT_CONTRACT = "0xD522395dfD017F47a932D788eC7CB058aDBbc783";

async function tvl(timestamp, ethBlock) {
  const balances = {};

  const stablecoins = (
    await sdk.api.abi.call({
      abi: abi.getAllAssets,
      target: VAULT_CONTRACT,
      block: ethBlock,
    })
  ).output;


    const balance_stablecoin = (
      await sdk.api.abi.call({
        abi: abi.checkBalance,
        target: VAULT_CONTRACT,
        block: ethBlock,
      })
    ).output;

    sdk.util.sumSingleBalance(balances, stablecoins, balance_stablecoin);

  return balances;
}

module.exports = {
  arbitrum: {
    tvl: tvl,
  },
};

