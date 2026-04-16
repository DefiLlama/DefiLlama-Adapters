const { Program } = require("@project-serum/anchor");
const { getProvider, sumTokens2, } = require("../helper/solana");

const idl = require('./idl')

const PYRON_MAIN_GROUP = 'HkKGvruFNa91TzNV8tSr345RPmyek6y8RZKfW55KV8Kr';
const VALID_ASSET_TAGS = [0, 1, 2, 3];

async function tvl() {
  const provider = getProvider('fogo')
  const program = new Program(idl, 'PyRon8FBSDSk6MxNKsZj2uZweBsa2nH5amyKnN6eN57', provider)
  const allBanks = await program.account.bank.all()

  const filteredBanks = allBanks.filter(({ account: bank }) => {
    return bank.group.toString() === PYRON_MAIN_GROUP;
  });

  const pyronBanks = filteredBanks.filter(({ account: bank }) => {
    const tag = bank.config?.assetTag;
    return VALID_ASSET_TAGS.includes(tag);
  });

  return sumTokens2({ chain: 'fogo', tokenAccounts: pyronBanks.map(i => i.account.liquidityVault.toString()) });
}

module.exports = {
  timetravel: false,
  fogo: { tvl, },
}
