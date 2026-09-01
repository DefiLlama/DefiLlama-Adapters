const { sumTokens2 } = require('../helper/unwrapLPs')
const { getConfig } = require('../helper/cache')
let data

async function getData() {
  if (!data) data = _internal()
  return data

  async function _internal() {
    return getConfig('powaa-protocol', "https://raw.githubusercontent.com/powaa-protocol/powaa-contract-config/main/prod.json")
  }
}

async function tvl(ts, block) {
  const config = await getData();
  const vaults = config["TokenVault"];
  const toa = vaults.map(i => [i.TokenAddress, i.VaultAddress])
  return sumTokens2({ block, tokensAndOwners: toa, })
}

module.exports = {
  timetravel: false,
  ethereum: {
    tvl,
  },
};
