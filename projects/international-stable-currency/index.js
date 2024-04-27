const { PublicKey } = require("@solana/web3.js");
const { getConnection, decodeAccount } = require("../helper/solana");

async function tvl() {
    const connection = getConnection();
    const mint = await connection.getAccountInfo(
        new PublicKey("J9BcrQfX4p9D1bvLzRNCbMDv8f44a9LFdeqNE4Yk2WMD")
    );
    const mintInfo = decodeAccount("mint", mint);
    const supply = mintInfo.supply.toString() / 10 ** mintInfo.decimals;
    return {
        "international-stable-currency": supply,
    };
}

module.exports = {
    timetravel: false,
    methodology: "Supply of ISC multiplied by the price of ISC in USD.",
    solana: {
        tvl,
    },
};