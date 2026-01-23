const sui = require("../helper/chain/sui");

// Example type: 0x384ab5f72d0ef84e3b7e0f63b595e1f6d6ff6fb991160ae803458534c0795457::vault::Vault<
//  0x2609a5d99772af4df0775c6167f9d72b428ce621a289fe5e5de2cb887ded6f4c::af_lp::AF_LP,
//  0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC
// >
const AFLP_VAULT_ID =
    "0xb0932e1b22b1e9b43ff6d8389b2c2a0b3f2db2a0d7b8a7981deacfda3fc59023";

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
