const {getTokenBalance} = require("./helper/solana")

async function tvl() {  
  const [
    paiPoolUsdcAmount,    paiPoolUsdtAmount,    paiPoolPaiAmount,
    ustPoolUsdcAmount,    ustPoolUsdtAmount,    ustPoolUstAmount,
    psolPoolSolAmount,    psolPoolPsolAmount  ] = await Promise.all([
      
    //pai3pool
    getTokenBalance(      "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",      "2dc3UgMuVkASzW4sABDjDB5PjFbPTncyECUnZL73bmQR"    ),
    getTokenBalance(      "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",      "2dc3UgMuVkASzW4sABDjDB5PjFbPTncyECUnZL73bmQR"    ),
    getTokenBalance(      "Ea5SjE2Y6yvCeW5dYTn7PYMuW5ikXkvbGdcmSnXeaLjS",      "2dc3UgMuVkASzW4sABDjDB5PjFbPTncyECUnZL73bmQR"    ),
    //ust3Pool
    getTokenBalance(      "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",      "FDonWCo5RJhx8rzSwtToUXiLEL7dAqLmUhnyH76F888D"    ),
    getTokenBalance(      "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",      "FDonWCo5RJhx8rzSwtToUXiLEL7dAqLmUhnyH76F888D"    ),
    getTokenBalance(      "CXLBjMMcwkc17GfJtBos6rQCo1ypeH6eDbB82Kby4MRm",      "FDonWCo5RJhx8rzSwtToUXiLEL7dAqLmUhnyH76F888D"    ),
    //psol2Pool
    getTokenBalance(      "So11111111111111111111111111111111111111112",      "8RXqdSRFGLX8iifT2Cu5gD3fG7G4XcEBWCk9X5JejpG3"    ),
    getTokenBalance(      "9EaLkQrbjmbbuZG9Wdpo8qfNUEjHATJFSycEmw6f1rGX",      "8RXqdSRFGLX8iifT2Cu5gD3fG7G4XcEBWCk9X5JejpG3"   ),

  ])
  return {

    'usd-coin': paiPoolUsdcAmount + ustPoolUsdcAmount,
    'usdp': paiPoolPaiAmount,
    'tether': paiPoolUsdtAmount + ustPoolUsdtAmount,
    'terrausd': ustPoolUstAmount,
    'solana': psolPoolSolAmount + psolPoolPsolAmount,

  }

}

module.exports = {
  tvl,
  methodology: 'To obtain the Mercurial TVL we make on-chain calls using the function getTokenBalance() that uses the address of the token and the address of the contract where the token is located. The addresses used are the 3pool addresses and the SOL 2pool address where the corresponding tokens were deposited and these addresses are hard-coded. This returns the number of tokens held in each contract. We then use Coingecko to get the price of each token in USD to export the sum of all tokens.',
}
