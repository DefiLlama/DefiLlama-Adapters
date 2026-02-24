const { Program } = require("@project-serum/anchor");
const { getProvider, sumTokens2, } = require("../helper/solana");

const idl = require('./idl')

// MarginFi main group address
const MARGINFI_MAIN_GROUP = '4qp6Fx6tnZkY5Wropq9wUYgtFxXKwE6viZxFHg3rdAG8';
const VALID_ASSET_TAGS = [0, 1, 2, 3]; 

async function tvl() { 
  const provider = getProvider() 
  const program = new Program(idl, 'MFv2hWf31Z9kbCa1snEPYctwafyhdvnV7FZnsebVacA', provider)
  const allBanks = await program.account.bank.all()

  // Filter banks by main_group
  const filteredBanks = allBanks.filter(({ account: bank }) => {
    return bank.group.toString() === MARGINFI_MAIN_GROUP;
  });

  // Further filter banks by config.assetTag (must be 1, 2 or 3)
  const marginfiBanks = filteredBanks.filter(({ account: bank }) => {
    const tag = bank.config?.assetTag;
    return VALID_ASSET_TAGS.includes(tag);
  });

  return sumTokens2({ tokenAccounts: marginfiBanks.map(i => i.account.liquidityVault.toString()) });
}

module.exports = {
  timetravel: false,
  solana: { tvl, },
}
