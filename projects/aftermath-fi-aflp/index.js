const sui = require("../helper/chain/sui");

// Example type: 0x9e20798d97c110f6b36b7b3d8543aa9246322ef2fd8d83ad79ef3325d473bc2f::vault::Vault<
//  0x08b18262b85423f64b60f279f0f1d935bb03b7cc9eebd8018e20bb1575f9d39a::af_lp::AF_LP,
//  0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC>
// >
const AFLP_VAULT_ID =
    "0x1f75030f3e687f824cce9354d96701cd72ab0e6f86a495fcca1ba70cabc13aea";

async function tvl(api) {
    const vault = await sui.getObject(AFLP_VAULT_ID);
    const types = vault.type.replace(">", "").split("<")[1];
    const collateralCoinType = types.split(", ")[1];
    const balance = vault.fields.total_deposited_collateral;
    api.add(collateralCoinType, balance);
}

module.exports = {
    methodology: "Tracks USDC collateral deposited into the Aftermath afLP vault on Sui",
    timetravel: false,
    sui: {
        tvl,
    }
}
