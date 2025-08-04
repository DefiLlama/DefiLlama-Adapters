const {getConfig} = require("../helper/cache");

async function tvl_ethereum_predeposit(api) {
  const RESERVE_STAKING = "0xBa0Ae7069f94643853Fce3B8Af7f55AcBC11e397";
  const SBTC = "0x094c0e36210634c3CfA25DC11B96b562E0b07624";
  const STONE = "0x7122985656e38BDC0302Db86685bb972b145bD3C";

  await api.sumTokens({ owner: RESERVE_STAKING, tokens: [SBTC, STONE] });
}

async function tvl_ethereum(api) {
  await tvl_ethereum_predeposit(api);

  const vaults = await getConfig('nest-vaults', "https://app.nest.credit/api/vaults?includeHidden=true");
  const ethereumVaults = vaults?.map(vault => vault.plume?.contractAddress) ?? [];
  const details = await api.multiCall({ abi: 'erc20:totalSupply', calls: ethereumVaults })
  api.add(ethereumVaults, details)
}

async function tvl_plume(api) {
  const vaults = await getConfig('nest-vaults', "https://app.nest.credit/api/vaults?includeHidden=true");
  const plumeVaults = vaults?.map(vault => vault.plume?.contractAddress) ?? [];
  const details = await api.multiCall({ abi: 'erc20:totalSupply', calls: plumeVaults })
  api.add(plumeVaults, details)
}

module.exports = {
  methodology: "TVL is calculated from the value of Nest tokens, which represent user shares in vaults backed by yield-generating assets.",
  ethereum: { tvl: tvl_ethereum },
  plume_mainnet: { tvl: tvl_plume },
}
