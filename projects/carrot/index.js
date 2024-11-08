const { PublicKey } = require('@solana/web3.js');
const { getConnection, } = require('../helper/solana')
const { decodeCarrotVault } = require('../helper/utils/solana/layouts/carrot');

async function tvl(api) {

  const connection = getConnection()
  const programId = 'CarrotwivhMpDnm27EHmRLeQ683Z1PufuqEmBZvD282s'

  const programAccounts = await connection.getProgramAccounts(new PublicKey(programId), {
    filters: [{
      memcmp: {
        offset: 8,
        bytes: 'CarrotLYPhQzYL4fEsTUvEzw5QDaMGSZUENHSkh7qzQa' // carrot multisig?
      },
    },]
  });

  programAccounts.forEach(({ account, pubkey }, i) => {
    const { assets, strategies} = decodeCarrotVault(account.data)
    const assetMap = {}
    assets.forEach(({assetId, mint }) => assetMap[assetId] = mint.toString())
    console.log(assetMap) 
    strategies.forEach(i => {
      api.add(assetMap[i.assetId], i.balance.toString())
    })
  })
}

module.exports = {
  doublecounted: true,
  timetravel: false,
  methodology: 'Tracks tvl via number of CRT tokens currently in circulation multiplied by the token price.',
  solana: { tvl },
}

