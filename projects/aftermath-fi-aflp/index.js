const sui = require("../helper/chain/sui");

// Example type: 0x1331a181525bf7852423ca2022a7cfc524370244b7f7ba04ebeee387d315545e::vault::Vault<
//   0x365c418bca2846daf281b6d9a42182e1b4e266c6348166f5e935cfa97722918a::template::TEMPLATE,
//   0xcdd397f2cffb7f5d439f56fc01afe5585c5f06e3bcd2ee3a21753c566de313d9::usdc::USDC
// >
const AFLP_VAULT_ID =
    "0xb950819c5eba1bb5980f714f2a3b1d8738e3da58a4d9daf5fa21b6c2a7dd1e12";

async function tvl(api) {
    const vault = await sui.getObject(AFLP_VAULT_ID);
    const types = vault.type.replace(">", "").split("<")[1];
    const collateralCoinType = types.split(", ")[1];
    const balance = vault.fields.total_deposited_collateral;
    api.add(collateralCoinType, balance);
}

module.exports = {
    methodology: "Returns the TVL of the afLP vault",
    sui: {
        tvl,
    }
}
