const { Program } = require("@project-serum/anchor");
const { getProvider, sumTokens2, } = require("../helper/solana");

const idl = require('./idl')

// MarginFi main group address
const MARGINFI_MAIN_GROUP = '4qp6Fx6tnZkY5Wropq9wUYgtFxXKwE6viZxFHg3rdAG8';
const VALID_ASSET_TAGS = [0, 1, 2, 3]; 

async function getBanks() {
  const provider = getProvider()
  const program = new Program(idl, 'MFv2hWf31Z9kbCa1snEPYctwafyhdvnV7FZnsebVacA', provider)
  const allBanks = await program.account.bank.all()

  // Filter banks by main_group and config.assetTag
  return allBanks.filter(({ account: bank }) => {
    return bank.group.toString() === MARGINFI_MAIN_GROUP && VALID_ASSET_TAGS.includes(bank.config?.assetTag);
  });
}

async function tvl() {
  const marginfiBanks = await getBanks()
  return sumTokens2({ tokenAccounts: marginfiBanks.map(i => i.account.liquidityVault.toString()) });
}

async function borrowed(api) {
  const marginfiBanks = await getBanks()
  marginfiBanks.forEach(({ account: bank }) => {
    // borrowed = totalLiabilityShares * liabilityShareValue, both I80F48 (value / 2^48)
    const shares = BigInt(bank.totalLiabilityShares.value.toString())
    const shareValue = BigInt(bank.liabilityShareValue.value.toString())
    const amount = (shares * shareValue) >> 96n
    api.add(bank.mint.toString(), Number(amount))
  })
}

module.exports = {
  timetravel: false,
  solana: { tvl, borrowed, },
}
