const sui = require("../helper/chain/sui");
const {getVaultTvlByAmountB} = require("../nemo/util");

const VAULT_LIST = [
  "0x18fe46d697a3ce2c87b62db5435678ff8df179efc913e250e888019d2f1c4105",
  "0x1c29c232ff5a34eb8edf9b3dd593890cd2c537d7a57e30c6730391271de0b5e6",
  "0x9356a36b0066561f66db7681d87537c8d9a992ca8e12095be91dcea500211015",
  "0x5ca7c661f9e454bbcd780f4d376ccbf536ec34402d99a840bdfb595021e9d727",
]

async function tvl(api) {
  const vaults = await sui.getObjects(VAULT_LIST);

  for (let vault of vaults) {
    const vaultTypes = vault.type.replace(">", "").split("<")[1].split(', ');
    const tvl = await getVaultTvlByAmountB(vault);
    api.add(vaultTypes[1], tvl);
  }
}

module.exports = {
  timetravel: false,
  methodology: 'Count all assets are deposited into Nemo vault.',
  sui: {
    tvl,
  },
};