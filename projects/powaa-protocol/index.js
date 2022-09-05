const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");
const { default: axios } = require("axios");

async function tvl(timestamp, block, chainBlocks) {
  const balances = {};

  const config = (
    await axios.get(
      "https://raw.githubusercontent.com/powaa-protocol/powaa-contract-config/main/dev.json"
    )
  ).data;
  const vaults = config["TokenVault"];
  const gov = config["GovLPVault"];

  const tokens = [
    ...vaults.map((v) => {
      return [
        v.TokenAddress,
        v.BaseAssets.length === 2 && v.Source === "Sushi",
      ];
    }),
    [gov.TokenAddress, gov.BaseAssets.length === 2 && gov.Source === "Sushi"],
  ];

  const vaultAddresses = [
    ...vaults.map((v) => {
      return v.VaultAddress;
    }),
    gov.VaultAddress,
  ];

  await sumTokensAndLPsSharedOwners(balances, tokens, vaultAddresses);
  return balances;
}

module.exports = {
  ethereum: {
    tvl,
  },
};
