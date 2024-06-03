const ADDRESSES = require("../helper/coreAssets.json");
const sui = require("../helper/chain/sui");
const { addUniV3LikePosition } = require("../helper/unwrapLPs");

const BUCKETUS_VAULT_AND_POOL_IDS = [
  {
    //NEW_BUCKETUS
    vaultID:
      "0x1a0b93fd2965ce3ceb4039c90b232ddee7b0e79015cab0ca10528bb5f4285188",
    poolID:
      "0x6ecf6d01120f5f055f9a605b56fd661412a81ec7c8b035255e333c664a0c12e7",
  },
  {
    //BUCKETUS
    vaultID:
      "0x6edfc992f6e775fe926a5e850661c151ad01e6149e9b34792a2102e1721065fc",
    poolID:
      "0x81fe26939ed676dd766358a60445341a06cea407ca6f3671ef30f162c84126d5",
  },
  {
    //FEE_RATE_BUCKETUS
    vaultID:
      "0x706a998f7f223b30c32ac3400a63721dae00f1b3e15169defeaafe2756af99c8",
    poolID:
      "0x81fe26939ed676dd766358a60445341a06cea407ca6f3671ef30f162c84126d5",
  },
];

const CETABLE_VAULT_ID =
  "0xeed4e7948f88f1f044b653717a7855eef6fe188e9cbbb103d5169f9bc3edd257";
const USDC_USDT_POOL_ID =
  "0xc8d7a1503dc2f9f5b05449a87d8733593e2f0f3e7bffd90541252782e4d2ca20";

const STAPREAL_VAULT_ID =
  "0x614c78eabb6949b3e1e295f19f6b8476e2e62091ca66432fbb5507e7b54af0d9";
const STAPEARL_PAIR_METADTA_ID =
  "0x243096d976a44de24fde33f087665f8265543a533b5cdbae60fc72a939669867";

function asIntN(int, bits = 32) {
  return Number(BigInt.asIntN(bits, BigInt(int)));
}

async function tvl(api) {
  for (const { vaultID, poolID } of BUCKETUS_VAULT_AND_POOL_IDS) {
    const vaultObjs = await sui.getObject(vaultID);
    const poolObjs = await sui.getObject(poolID);

    const pool = poolObjs.fields;
    const position = vaultObjs.fields.position.fields;

    addUniV3LikePosition({
      api,
      tickLower: asIntN(position.tick_lower_index.fields.bits),
      tickUpper: asIntN(position.tick_upper_index.fields.bits),
      tick: asIntN(pool.current_tick_index.fields.bits),
      liquidity: position.liquidity,
      token0: ADDRESSES.sui.BUCK,
      token1: ADDRESSES.sui.USDC,
    });
  }

  const cetableVaultObjs = await sui.getObject(CETABLE_VAULT_ID);
  const cetablePoolObjs = await sui.getObject(USDC_USDT_POOL_ID);

  const cetablePool = cetablePoolObjs.fields;
  const cetablePosition = cetableVaultObjs.fields.position.fields;

  addUniV3LikePosition({
    api,
    tickLower: asIntN(cetablePosition.tick_lower_index.fields.bits),
    tickUpper: asIntN(cetablePosition.tick_upper_index.fields.bits),
    tick: asIntN(cetablePool.current_tick_index.fields.bits),
    liquidity: cetablePosition.liquidity,
    token0: ADDRESSES.sui.USDT,
    token1: ADDRESSES.sui.USDC,
  });

  const stapearlVaultObjs = await sui.getObject(STAPREAL_VAULT_ID);
  const stapearlPairMetadataObjs = await sui.getObject(
    STAPEARL_PAIR_METADTA_ID
  );

  const stapearlLpAmount = stapearlVaultObjs.fields.position.fields.amount;
  const stapearlPairMetadataFields =
    stapearlPairMetadataObjs.fields.value.fields;
  const stapearlLpSupply = stapearlPairMetadataFields.lp_supply.fields.value;
  const stapearlReserveX = stapearlPairMetadataFields.reserve_x.fields.balance;
  const stapearlReserveY = stapearlPairMetadataFields.reserve_y.fields.balance;

  const stapearlUSDCAmount =
    (stapearlLpAmount * stapearlReserveX) / stapearlLpSupply;
  const stapearlUSDTAmount =
    (stapearlLpAmount * stapearlReserveY) / stapearlLpSupply;

  api.add(ADDRESSES.sui.USDC, stapearlUSDCAmount);
  api.add(ADDRESSES.sui.USDT, stapearlUSDTAmount);
}

module.exports = {
  timetravel: false,
  sui: {
    tvl,
  },
};
