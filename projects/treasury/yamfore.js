const { sumTokens2 } = require("../helper/chain/cardano");
const { assetsAddresses } = require('../helper/chain/cardano/blockfrost');
const { nullAddress } = require("../helper/tokenMapping");

async function adaHandleToAddress(handle) {
  // https://docs.adahandle.com/reference/api-reference/cardano-node
  const policyID = 'f0ff48bbb7bbe9d59a40f1ce90e9e9d0ff5002ec48f232b49ca0fb9a';
  const assetName = Buffer.from(handle).toString('hex');
  const [holder] = await assetsAddresses(`${policyID}000de140${assetName}`)
  return holder.address
}

async function tvl() {
  // const TREASURY_ADDRESS = await adaHandleToAddress('bigblymp')
  const TREASURY_ADDRESS = 'addr1qx2m86m788l8zrcc6ecfg0yq698s2ryqpz3c52z2ratw5jh8yqevyugcr8w4ezlj3sry6798h9ynqjgce3mqfwxfma9qts79w0'

  return sumTokens2({
    owners: [TREASURY_ADDRESS,], tokens: [
      nullAddress,
      'c48cbb3d5e57ed56e276bc45f99ab39abe94e6cd7ac39fb402da47ad0014df105553444d'
    ],
  })
}

async function ownTokens() {
  // const TREASURY_ADDRESS = await adaHandleToAddress('bigblymp')
  const TREASURY_ADDRESS = 'addr1qx2m86m788l8zrcc6ecfg0yq698s2ryqpz3c52z2ratw5jh8yqevyugcr8w4ezlj3sry6798h9ynqjgce3mqfwxfma9qts79w0'

  return sumTokens2({
    owners: [TREASURY_ADDRESS,], tokens: [
      'ee0633e757fdd1423220f43688c74678abde1cead7ce265ba8a24fcd43424c50',
    ],
  })
}

module.exports = {
  cardano: {
    tvl, ownTokens,
  },
};
