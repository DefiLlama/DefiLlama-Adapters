const { getConfig } = require("../helper/cache");
const collateralReaderContractABI = require("./abis/collateral-reader.json");
const ebcakeReaderContractABI = require("./abis/ebcake-reader.json");
const { getUniqueAddresses } = require('../helper/utils')

const BigNumber = require("bignumber.js");
const { sumTokens2 } = require("../helper/unwrapLPs");
const { staking } = require("../helper/staking");

const TOKEN_LIST_URL = "https://app.duet.finance/tokens.json";
const COLLATERAL_READER_CONTRACT = "0xFfB8FD0E5eA13bb71401B19e00f9F934746f0b7A";
const DUET = '0x95EE03e1e2C5c4877f9A298F1C0D6c98698FAB7B'

async function getEBCakeTvl(api) {
  const EBCAKE_READER_CONTRACT = "0x243F8da5893E534CBd25220b6E277420dd9dE77B";
  const ret = await api.call({
    abi: ebcakeReaderContractABI.extendableBondGroupInfo,
    target: EBCAKE_READER_CONTRACT,
    params: ["yearly"]
  });
  api.add('0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82', ret.allEbStacked)
}

async function tvl(api) {
  const ret = await getConfig("duet-fi", TOKEN_LIST_URL);
  const vaultList = [];
  for (const token of ret) {
    if (!token.vaults || token.vaults.length < 1) {
      continue;
    }
    vaultList.push(...token.vaults);
  }
  const uniqueVaults = getUniqueAddresses(vaultList
    .filter((vault) => vault.dAssetsType !== "DASSETS")
    .map((vault) => vault.vaultAddress && vault.vaultAddress.trim())
    .filter(i => i))

  const tokensAndOwners = []
  const underlyings = await api.multiCall({ abi: 'address:underlying', calls: uniqueVaults })
  const underlyingMap = uniqueVaults.reduce((acc, v, i) =>{
    acc[v] = underlyings[i]
    return acc
  }, {})
  const pairs = await api.multiCall({ abi: 'address:pair', calls: uniqueVaults, permitFailure: true, })
  const maybeIsSingle = uniqueVaults.filter((v, i) => {
    if (!pairs[i]) return true
    tokensAndOwners.push([pairs[i], underlyingMap[v]])
  })
  const tokens = await api.multiCall({ abi: 'address:underlyingToken', calls: maybeIsSingle, permitFailure: true,  })
  maybeIsSingle.forEach((v, i) => {
    if (!tokens[i]) return;
    tokensAndOwners.push([tokens[i], underlyingMap[v]])
  })
  // api.add('tether', (await getEBCakeTvl(api)) / 1e8, { skipChain: true })

  await getEBCakeTvl(api)
  return sumTokens2({ tokensAndOwners, api, resolveLP: true, blacklistedTokens: [DUET]})

  // const tokenTvls = await api.multiCall({ abi: collateralReaderContractABI.depositVaultValues, target: COLLATERAL_READER_CONTRACT, calls: uniqueVaults.map(i => ({ params: [[i], false] })) })
  // api.add('tether', (await getEBCakeTvl(api)) / 1e8, { skipChain: true })
  // tokenTvls.forEach(v => {
  //   if (v) api.add('tether', v[1][0] / 1e8, { skipChain: true })
  // })
}

module.exports = {
  tvl, staking: staking('0x29fd5bdca277eb5b8c31314e259c7feabd1badd4', DUET)
}
