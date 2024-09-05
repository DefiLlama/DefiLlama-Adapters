const { Connection, PublicKey } = require('@solana/web3.js');
const axios = require('axios');

async function fetchTokenPrice(mintAddress) {
  try {
    const response = await axios.get(`https://api.coingecko.com/api/v3/simple/token_price/solana?contract_addresses=${mintAddress}&vs_currencies=usd`);
    return response.data[mintAddress]?.usd || 0;
  } catch (error) {
    console.error('Error fetching token price:', error);
    return 0;
  }
}

async function getTvl() {
  try {
    const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
    const owner = new PublicKey("Ec5tJ1H24iVSM2L8Yd7SHf7bjtD7FUWDiYSeESpFYynM");
    const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
    const response = await connection.getParsedTokenAccountsByOwner(owner, {
      programId: TOKEN_PROGRAM_ID,
    });

    let totalValue = 0;
    for (const accountInfo of response.value) {
      const mintAddress = accountInfo.account.data.parsed.info.mint;
      const tokenAmount = parseFloat(accountInfo.account.data.parsed.info.tokenAmount.amount);
      const decimals = parseInt(accountInfo.account.data.parsed.info.tokenAmount.decimals);
      
      const tokenPrice = await fetchTokenPrice(mintAddress);
      
      const amountInUsd = tokenAmount / (10 ** decimals) * tokenPrice;
      totalValue += amountInUsd;
    }
    console.log(totalValue)

    return totalValue;
  } catch (error) {
    console.error('Error fetching token accounts:', error);
  }
}

const {  getConnection, } = require("../helper/solana");

async function tvl() {
  const connection = getConnection();
  const tvlSolana = await getTvl()
  console.log(tvlSolana)
  return {
    solana: tvlSolana
  }
}

module.exports = {
  timetravel: false,
  solana: { tvl, },
}
