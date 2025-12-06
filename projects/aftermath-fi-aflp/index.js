const utils = require("../helper/utils");

const AFLP_VAULT_ID =
    "0xb950819c5eba1bb5980f714f2a3b1d8738e3da58a4d9daf5fa21b6c2a7dd1e12";

async function tvl() {
    const usdc = await utils.fetchURL(
        `https://aftermath.finance/api/perpetuals/vaults/${AFLP_VAULT_ID}/tvl`
    );

    return {
        usdc,
    }
}

module.exports = {
    timetravel: false,
    methodology: "Returns the TVL of the AFLP vault",
    sui: {
        tvl,
    }
}
