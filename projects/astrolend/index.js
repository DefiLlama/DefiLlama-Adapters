const { Program } = require("@coral-xyz/anchor");
const { getProvider, sumTokens2, } = require("../helper/solana");

const idl = require('./idl');

const utils = require("./utils/conversion");
const GROUP_MAINNET= "8GzZHDKts3oHeL91h4fYjbjaAcUicBb8NB6ZTLTHvYr6"
async function tvl() {
    const provider = getProvider("eclipse")
    const program = new Program(idl, provider)
   
    const banks= (await program.account.bank.all()).filter((bank)=>{
      return bank.account.group.toString()== GROUP_MAINNET
     })
    
        const map = banks.reduce((acc, bank) => {
        // Convert the mint to a string to use it as an object key.
        const mintString = 'eclipse:'+bank.account.mint.toString();
      
        // Set the object property to the numeric value you want.
        acc[mintString] = utils.conversion.wrappedI80F48toBigNumber(
          bank.account.totalAssetShares.value
        );
      
        return acc;
      }, {});
   return map
   
}

module.exports = {
  timetravel: false,
  solana: { tvl, },
}
