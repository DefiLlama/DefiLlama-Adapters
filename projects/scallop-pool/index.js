const anchor = require("@project-serum/anchor");
const { PublicKey } = require("@solana/web3.js");
const activePoolBases = require("./active-pools.json");
const { getConnection, decodeAccount } = require("../helper/solana");
const sdk = require('@defillama/sdk')

const SCALLOP_PROGRAM_ID = new PublicKey("SCPv1LabixHirZbX6s7Zj3oiBogadWZvGUKRvXD3Zec");

// seeds
const COUPON_SEED = "coupon_seed";
const POOL_AUTHORITY = "pool_authority_seed";

function getTokenGeckoId(mintAuthority) {
  for (let i = 0; i < activePoolBases.length; i++) {
    const pubkey = new PublicKey(activePoolBases[i].base)
    const [couponMintAuthority, _couponMintAuthorityBump] = PublicKey.findProgramAddressSync([
      anchor.utils.bytes.utf8.encode(POOL_AUTHORITY),
      pubkey.toBytes()
    ], SCALLOP_PROGRAM_ID);
    if (couponMintAuthority.equals(mintAuthority))
      return activePoolBases[i].coingeckoId;
  }
}

async function solanaTvl() {
  const connection = getConnection()

  // at Scallop, coupon representing deposited amount of a pool
  let couponAddresses = [];
  for (let i = 0; i < activePoolBases.length; i++) {
    const pubkey = new PublicKey(activePoolBases[i].base)
    const [couponAddress, _couponAddressBump] = PublicKey.findProgramAddressSync([
      anchor.utils.bytes.utf8.encode(COUPON_SEED),
      pubkey.toBytes()
    ], SCALLOP_PROGRAM_ID);
    couponAddresses.push(couponAddress);
  }

  const balances = {}
  const coupons = await connection.getMultipleAccountsInfo(couponAddresses);
  coupons.forEach((curr) => {
    if (curr === null)
      return;

    if (curr.data.length !== 82) // invalid mint
      return;

    const mintInfo = decodeAccount('mint', curr);
    const geckoId = getTokenGeckoId(mintInfo.mintAuthority)
    if (!geckoId) return;
    const amount = (mintInfo.supply.toString() / Math.pow(10, mintInfo.decimals))
    sdk.util.sumSingleBalance(balances, geckoId, amount)
  });
  return balances;
}

module.exports = {
    timetravel: false,
    solana: {
      tvl: solanaTvl,
    },
  }