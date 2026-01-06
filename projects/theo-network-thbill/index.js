const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs")
const { getConnection } = require("../helper/solana")
const { PublicKey } = require("@solana/web3.js")

const ULTRA_TOKEN_ACCOUNT = '6fk5UwZXF1Zs327zV5Fbmay2xTYCqg7eM5QeNQyyu7ae'
const ULTRA_ETH = '0x50293DD8889B931EB3441d2664dce8396640B419'

async function solanaTvl(api) {
  const connection = getConnection()
  const accountInfo = await connection.getAccountInfo(new PublicKey(ULTRA_TOKEN_ACCOUNT))
  if (accountInfo) {
    const balance = Number(accountInfo.data.readBigUInt64LE(64))
    api.add('ethereum:' + ULTRA_ETH, balance, { skipChain: true })
  }
}

module.exports = {
  ethereum: {
    tvl: sumTokensExport({ owner: '0xAECCa546baFB16735b273702632C8Cbb83509d8F', tokens: ['0x50293DD8889B931EB3441d2664dce8396640B419', ADDRESSES.ethereum.USDC,] })
  },
  arbitrum: {
    tvl: sumTokensExport({ owner: '0xAECCa546baFB16735b273702632C8Cbb83509d8F', tokens: ['0xc26af85ede9cc25d449bcebef866bb85afd5d346',] })
  },
  solana: {
    tvl: solanaTvl
  },
}
