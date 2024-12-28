const { getConnection, exportDexTVL, sumTokens2, } = require("./helper/solana");
const { PublicKey } = require('@solana/web3.js')
const DEX_PROGRAM_ID = 'CTMAxxk34HjKWxQ3QLZK1HpaLXmBveao3ESePXbiyfzh'

async function fetchStaking() {
  return sumTokens2({ owners: ['5mEH7a7abQwUEXqfusVepc3z9cHVQg8uhqTXdq47J91o'] });
}

async function getTokenAccounts() {
  // structure taken from https://github.com/CropperFinance/cropper_instructions/blob/main/amm-instructions/amm_stats.rs#L323
  const programId = new PublicKey(DEX_PROGRAM_ID);
  const connection = getConnection();
  const accounts = await connection.getProgramAccounts(programId, {
    filters: [{
      dataSize: 291
    }]
  });
  const tokenAccounts = []
  accounts.forEach(({ account: { data }}) => {
    let i = 3 + 32 * 4 // offset
    const tokenAccountA = new PublicKey(data.subarray(i, i+32)).toString()
    i += 32
    const tokenAccountB= new PublicKey(data.subarray(i, i+32)).toString()
    tokenAccounts.push(tokenAccountA, tokenAccountB)
  })
  return tokenAccounts
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  solana: {
    tvl: exportDexTVL(DEX_PROGRAM_ID, getTokenAccounts),
    staking: fetchStaking
  }
}