const { PublicKey } = require('@solana/web3.js');
const {getConnection, decodeAccount, } = require('./helper/solana')

const MAINNET_STAKEPOOL_PROGRAM_ID = 'GUAMR8ciiaijraJeLDEDrFVaueLm9YzWWY9R7CBPL9rA';

async function tvl(){
  const connection = getConnection()
  const poolInfoAccount = await connection.getAccountInfo(new PublicKey(MAINNET_STAKEPOOL_PROGRAM_ID))
  const decoded = decodeAccount('ESOLStakePool', poolInfoAccount)
  return {
    'solana': decoded.totalLamports.toNumber()/1e9
  }
}

module.exports={
  timetravel: false,
  solana:{
    tvl 
  },
}
