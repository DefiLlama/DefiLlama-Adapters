const { get_account_tvl } = require("../helper/chain/eos");

// 1DEX
// https://1dex.com
async function eos() {
    const accounts = ["app.1dex", "portal.1dex"];
    const tokens = [
        ["eosio.token", "EOS", "eos"],
        ["tethertether", "USDT", "tether"]
    ];
    return await get_account_tvl(accounts, tokens, "eos");
}

module.exports = {
    methodology: `1DEX TVL is achieved by querying token balances from swap smart contract.`,
    eos: {
      tvl: eos
    },
}
