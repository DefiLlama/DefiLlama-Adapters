const { sumTokens2 } = require('../helper/solana')

async function tvl(api) {
  const vaults = ['CMBwsHiUnih1VAzENzoNKTq8tyRaCpD2zBgBUm47sN6h']
  return sumTokens2({ owners: vaults, api, })

}

module.exports = {
  solana: { tvl },
  methodology: 'Counts the amount SOL/LST in the vault',
}