const { getObject } = require("../helper/chain/sui");

const pharosVaults = [
  "0x1c2bc8b553d9a7e61f7531a3a4bf2162f4569268", // vRPCWeeklyVault
  "0x94f7ebc6ae0819a4b4e231ae6ddaaf9bfd2a1a86", // vRPCQuarterlyVault
  "0xee26bb0989691735c997dfdc49a4a607f75e190b", // vRPCSemiYearlyVault
  "0x39976f3Ef143a5824d4E4c28c204d556113dCF7f", // pCreditVault
];

const TREASURY_CAP_OBJECT_ID =
  "0xed99bfb3ee72cd1eb8be16a562b1f0996a050670e227ee6ebc7b829d935fbb36";
const RCUSD_DECIMALS = 6;

async function pharosTvl(api) {
  return api.erc4626Sum2({ calls: pharosVaults });
}

async function suiTvl(api) {
  const treasury = await getObject(TREASURY_CAP_OBJECT_ID);
  const totalSupply = treasury.fields.total_supply.fields.value;

  api.addUSDValue(Number(totalSupply) / 10 ** RCUSD_DECIMALS);
}

module.exports = {
  methodology:
    "TVL represents the total value of assets held within the vault. Each vault token is minted using USDC and appreciates in line with the performance of the underlying asset.",
  pharos: {
    tvl: pharosTvl,
  },
  sui: {
    tvl: suiTvl,
  },
};
