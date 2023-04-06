const { getConfig } = require("../helper/cache");
const sdk = require("@defillama/sdk");
const collateralReaderContractABI = require("./abis/collateral-reader.json");
const ebcakeReaderContractABI = require("./abis/ebcake-reader.json");

const BigNumber = require("bignumber.js");
const proPoolABI = require("./abis/pro-pool.json");

const TOKEN_LIST_URL = "https://app.duet.finance/tokens.json";
const COLLATERAL_READER_CONTRACT = "0xFfB8FD0E5eA13bb71401B19e00f9F934746f0b7A";

async function getEBCakeTvl() {
  const EBCAKE_READER_CONTRACT = "0x243F8da5893E534CBd25220b6E277420dd9dE77B";
  try {
    const ret = await sdk.api.abi.call({
      abi: ebcakeReaderContractABI.extendableBondGroupInfo,
      chain: "bsc",
      target: EBCAKE_READER_CONTRACT,
      params: ["yearly"]
    });
    return ret.output.faceUsdValue;
  } catch (e) {
    // console.error(e);
    return 0;
  }
}

async function fetch() {
  const ret = await getConfig("duet-fi", TOKEN_LIST_URL);
  const tokens = ret;
  const vaultList = [];
  for (const token of tokens) {
    if (!token.vaults || token.vaults.length < 1) {
      continue;
    }
    vaultList.push(...token.vaults);
  }
  const uniqueVaults = new Set(vaultList
    .filter((vault) => vault.displayPosition !== "DASSETS")
    .map((vault) => vault.vaultAddress && vault.vaultAddress.trim())
    .filter(Boolean));

  const tokenTvls = await Promise.all([...uniqueVaults].map(async (vault) => {
    try {
      return (await sdk.api.abi.call({
        abi: collateralReaderContractABI.depositVaultValues,
        chain: "bsc",
        target: COLLATERAL_READER_CONTRACT,
        params: [[vault], false]
      })).output[1][0];
    } catch (e) {
      // console.error(e, vault);
      return null;
    }
  }));
  await getEBCakeTvl();
  const tvl = tokenTvls
    .filter(Boolean)
    .reduce((previous, current) => new BigNumber(previous).plus(current), new BigNumber(0))
    .plus(await getEBCakeTvl())
    .div(Math.pow(10, 8));
  return { usd: tvl.toNumber() };
}

module.exports = fetch;
