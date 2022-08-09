const anchor = require("@project-serum/anchor");
const { PublicKey } = require("@solana/web3.js");
const activePoolBases = require("./active-pools.json");
const { getConnection } = require("../helper/solana");
const { MintLayout } = require("@solana/spl-token");
const { fetchURL } = require("../helper/utils");

const SCALLOP_PROGRAM_ID = new PublicKey("SCPv1LabixHirZbX6s7Zj3oiBogadWZvGUKRvXD3Zec");

// seeds
const COUPON_SEED = "coupon_seed";
const POOL_AUTHORITY = "pool_authority_seed";

function getPriceByMintAuthority(mintAuthority, pricesData) {
    let price = 0;
    for (let i = 0; i < activePoolBases.length; i++) {
        try {
            const pubkey = new PublicKey(activePoolBases[i].base)
            const [couponMintAuthority, _couponMintAuthorityBump] = PublicKey.findProgramAddressSync([
                anchor.utils.bytes.utf8.encode(POOL_AUTHORITY),
                pubkey.toBytes()
            ], SCALLOP_PROGRAM_ID);
            if (couponMintAuthority.equals(mintAuthority)) {
                price += pricesData[activePoolBases[i].coingeckoId]?.usd || 0;
            }
        }
        catch (e) { }
    }
    return price;
}

async function tvl() {
    const connection = getConnection()

    // at Scallop, coupon representing deposited amount of a pool
    let couponAddresses = [];
    let allIds = [];
    for (let i = 0; i < activePoolBases.length; i++) {
        try {
            const pubkey = new PublicKey(activePoolBases[i].base)
            const [couponAddress, _couponAddressBump] = PublicKey.findProgramAddressSync([
                anchor.utils.bytes.utf8.encode(COUPON_SEED),
                pubkey.toBytes()
            ], SCALLOP_PROGRAM_ID);
            couponAddresses.push(couponAddress);
            allIds.push(activePoolBases[i].coingeckoId)
        } catch (e) { }
    }
    const pricesData = (await fetchURL(
        `https://api.coingecko.com/api/v3/simple/price?ids=${allIds}&vs_currencies=usd`
    )).data;

    let total = 0;
    try {
        const coupons = await connection.getMultipleAccountsInfo(couponAddresses);
        total = coupons.reduce(function (sum, curr) {
            if (curr === null)
                return sum;

            if (curr.data.length !== MintLayout.span) {
                // invalid mint
                return sum;
            }

            try {
                const mintInfo = MintLayout.decode(curr.data);
                const price = getPriceByMintAuthority(mintInfo.mintAuthority, pricesData);
                const amount = (mintInfo.supply.toString() / Math.pow(10, mintInfo.decimals))
                return sum + ((amount * price) || 0)
            } catch (e) {
                return sum + 0;
            }
        }, 0);
    } catch (e) { }
    return total;
}

module.exports = {
    timetravel: false,
    solana: {
      tvl,
    },
}