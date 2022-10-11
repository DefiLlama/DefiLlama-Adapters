const { default: axios } = require("axios");
const { sumTokens2 } = require('../helper/unwrapLPs')
const { sumUnknownTokens } = require('../helper/unknownTokens')

async function tvl(ts, block) {
  const config = (
    await axios.get(
      "https://raw.githubusercontent.com/powaa-protocol/powaa-contract-config/main/prod.json"
    )
  ).data;
  const vaults = config["TokenVault"];
  const toa = vaults.map(i => [i.TokenAddress, i.VaultAddress])
  return sumTokens2({ block, tokensAndOwners: toa, })
}

async function pool2(ts, block) {
  const config = (
    await axios.get(
      "https://raw.githubusercontent.com/powaa-protocol/powaa-contract-config/main/prod.json"
    )
  ).data;
  const gov = config["GovLPVault"];
  const toa = [[gov.TokenAddress, gov.VaultAddress]]
  return sumUnknownTokens({ block, tokensAndOwners: toa, useDefaultCoreAssets: true })
}

module.exports = {
  timetravel: false,
  ethereum: {
    tvl,
    pool2,
  },
};
