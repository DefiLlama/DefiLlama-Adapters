
const sui = require("../helper/chain/sui");
const ADDRESSES = require("../helper/coreAssets.json");

// Vault Registries
const VAULT_REGISTRY_SUI = "0xa16f2aef5db003653344700dec7a8151ba6bf029db6bbf8d70025f5a55ff042e";
const VAULT_REGISTRY_HASUI = "0xa985fcebf0ebbca978553f3bd134042ae858a7e1c8f78013d1e6ce95fae7c774";
const VAULT_REGISTRY_WAL = "0x6bd5d2d267552a0253a345a3f5a16afc6f3d941a18efa25030935b3f0a370218";
const VAULT_REGISTRY_IKA = "0xfd7e8f66263a0ffa208ac0fa28d7004a7e464453207e3d29887e65ae0337c3e8";
// PSM
const PSM_V2_ID = "0x3fe88fd7ba9a81a79a711ad4193c016febf7adae58f07e7a1c867dba6ea468a7";

// Coin types
const HASUI = "0xbde4ba4c2e274a60ce15c1cfff9e5c42e41654ac8b6d906a57efa4bd3c29f47d::hasui::HASUI";
const WAL = "0x356a26eb9e012a68958082340d4c4116e7f55615cf27affcff209cf0ae544f59::wal::WAL";
const IKA = "0x7262fb2f7a3a14c888c438a3cd9b912469a58cf60f367352c46584262e8299aa::ika::IKA";

async function tvl(api) {
  // Fetch all objects in parallel
  const [registrySUI, registryHASUI, registryWAL, registryIKA, psmV2] = await Promise.all([
    sui.getObject(VAULT_REGISTRY_SUI),
    sui.getObject(VAULT_REGISTRY_HASUI),
    sui.getObject(VAULT_REGISTRY_WAL),
    sui.getObject(VAULT_REGISTRY_IKA),
    sui.getObject(PSM_V2_ID),
  ]);

  // Collateral in vaults (SUI)
  const totalCollateralSUI = Number(registrySUI.fields.total_collateral) / 1e9;
  api.add(ADDRESSES.sui.SUI, totalCollateralSUI);

  // Collateral in vaults (haSUI)
  const totalCollateralHASUI = Number(registryHASUI.fields.total_collateral) / 1e9;
  api.add(HASUI, totalCollateralHASUI);

  // Collateral in vaults (WAL)
  const totalCollateralWAL = Number(registryWAL.fields.total_collateral) / 1e9;
  api.add(WAL, totalCollateralWAL);

  // Collateral in vaults (IKA)
  const totalCollateralIKA = Number(registryIKA.fields.total_collateral) / 1e9;
  api.add(IKA, totalCollateralIKA);

  // PSM V2 (USDC)
  const psmBalance = Number(psmV2.fields.collateral_balance);
  api.add(ADDRESSES.sui.USDC_CIRCLE, psmBalance);
}

module.exports = {
  timetravel: false,
  sui: {
    tvl
  },
};