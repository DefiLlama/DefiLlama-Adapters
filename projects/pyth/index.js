const { PublicKey } = require("@solana/web3.js");
const { getConnection } = require("../helper/solana");

async function staking() {
  const account = await getConnection().getAccountInfo(new PublicKey('6njqtZeuLbSFU7Yo72GxPcdwhLQWahEPx1iN9GD6DRgV'))
  const locked = await account.data.readBigUint64LE(17+8)

  return {
    "solana:HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3": locked.toString()
  }
}

module.exports={
    timetravel: false,
    solana:{
        tvl:async()=>({}),
        staking
    }
}