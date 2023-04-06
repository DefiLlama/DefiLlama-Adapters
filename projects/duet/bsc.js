const { getConfig } = require("../helper/cache");
const sdk = require("@defillama/sdk");
const collateralReaderContractABI = require("./abis/collateral-reader.json");
const ebcakeReaderContractABI = require("./abis/ebcake-reader.json");
const { getUniqueAddresses } = require('../helper/utils')

const BigNumber = require("bignumber.js");
const proPoolABI = require("./abis/pro-pool.json");

const TOKEN_LIST_URL = "https://app.duet.finance/tokens.json";
const COLLATERAL_READER_CONTRACT = "0xFfB8FD0E5eA13bb71401B19e00f9F934746f0b7A";

async function getEBCakeTvl() {
  const EBCAKE_READER_CONTRACT = "0x243F8da5893E534CBd25220b6E277420dd9dE77B";
  const ret = await sdk.api.abi.call({
    abi: ebcakeReaderContractABI.extendableBondGroupInfo,
    chain: "bsc",
    target: EBCAKE_READER_CONTRACT,
    params: ["yearly"]
  });
  return ret.output.faceUsdValue;
}

async function fetch(_, _1, _2, { api }) {
  const ret = await getConfig("duet-fi", TOKEN_LIST_URL);
  const tokens = ret;
  const vaultList = [];
  for (const token of tokens) {
    if (!token.vaults || token.vaults.length < 1) {
      continue;
    }
    vaultList.push(...token.vaults);
  }
  const uniqueVaults = getUniqueAddresses(vaultList
    .filter((vault) => vault.displayPosition !== "DASSETS")
    .map((vault) => vault.vaultAddress && vault.vaultAddress.trim())
    .filter(i => i))

  
  const tokenTvls = await api.multiCall({  abi: collateralReaderContractABI.depositVaultValues, target: COLLATERAL_READER_CONTRACT, calls: [...uniqueVaults].map(i => ({ params: [[i], false]}))}) 
  api.add('tether', (await getEBCakeTvl(api))/1e8, { skipChain: true } )
  tokenTvls.forEach(v => {
    if (v) api.add('tether', v[1][0]/1e8, { skipChain: true })
  })
}

module.exports = fetch;
