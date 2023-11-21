const sdk = require("@defillama/sdk");

const chain = "manta";
const LEND_LORD_VAULT_CONTRACT = "0x05c576786B1B96C69917eDc4E8162D39aFe03cD0";

async function tvl(_, _b, { [chain]: block }) {
  const { output: tokens } = await sdk.api.abi.call({
    abi: abi.getAssets,
    target: LEND_LORD_VAULT_CONTRACT,
    chain,
    block,
  });

  const assetsInfo = await Promise.all(
    tokens.map(async (token) => {
      const { output: liquidity } = await sdk.api.abi.call({
        abi: abi.getAssetTotalLiquidity,
        target: LEND_LORD_VAULT_CONTRACT,
        params: token,
        chain,
        block,
      });

      return {
        [`${chain}:${token}`]: liquidity,
      };
    })
  );

  let balances = {};

  assetsInfo.map((i) => {
    balances = { ...balances, ...i };
  });

  return balances;
}

const abi = {
  getAssets: "address[]:getAssets",
  getAssetTotalLiquidity:
    "function getAssetTotalLiquidity(address) view returns (uint256 amount)",
};

module.exports = {
  manta: { tvl },
};
