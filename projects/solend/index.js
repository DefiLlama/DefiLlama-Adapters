const {getTokenBalance} = require('../helper/solana')

async function tvl() {
    const [usdcAmount,
          btcAmount,
          ethAmount,
          srmAmount,
          usdtAmount,
          fttAmount,
          rayAmount,
          sbrAmount,
          merAmount,
          solAmount,
          msolAmount, ] = await Promise.all([

        getTokenBalance("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", "DdZR6zRFiUt4S5mg7AV1uKB2z1f1WzcNYCaTEEWPAuby"),
        getTokenBalance("9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E", "DdZR6zRFiUt4S5mg7AV1uKB2z1f1WzcNYCaTEEWPAuby"),
        getTokenBalance("2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk", "DdZR6zRFiUt4S5mg7AV1uKB2z1f1WzcNYCaTEEWPAuby"),
        getTokenBalance("SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt", "DdZR6zRFiUt4S5mg7AV1uKB2z1f1WzcNYCaTEEWPAuby"),
        getTokenBalance("Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", "DdZR6zRFiUt4S5mg7AV1uKB2z1f1WzcNYCaTEEWPAuby"),
        getTokenBalance("AGFEad2et2ZJif9jaGpdMixQqvW5i81aBdvKe7PHNfz3", "DdZR6zRFiUt4S5mg7AV1uKB2z1f1WzcNYCaTEEWPAuby"),
        getTokenBalance("4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R", "DdZR6zRFiUt4S5mg7AV1uKB2z1f1WzcNYCaTEEWPAuby"),
        getTokenBalance("Saber2gLauYim4Mvftnrasomsv6NvAuncvMEZwcLpD1", "DdZR6zRFiUt4S5mg7AV1uKB2z1f1WzcNYCaTEEWPAuby"),
        getTokenBalance("MERt85fc5boKw3BW1eYdxonEuJNvXbiMbs6hvheau5K", "DdZR6zRFiUt4S5mg7AV1uKB2z1f1WzcNYCaTEEWPAuby"),
        getTokenBalance("So11111111111111111111111111111111111111112", "DdZR6zRFiUt4S5mg7AV1uKB2z1f1WzcNYCaTEEWPAuby"),
        getTokenBalance("mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So", "DdZR6zRFiUt4S5mg7AV1uKB2z1f1WzcNYCaTEEWPAuby"),



    ])
    return {
        'bitcoin': btcAmount,
        'usd-coin': usdcAmount,
        'ethereum': ethAmount,
        'serum': srmAmount,
        'tether': usdtAmount,
        'ftx-token': fttAmount,
        'raydium': rayAmount,
        'saber': sbrAmount,
        'mercurial': merAmount,
        'solana': solAmount,
        'msol': msolAmount,
    }
}

module.exports = {
    timetravel: false,
    tvl,
    methodology: 'TVL consists of deposits made to the protocol and like other lending protocols, borrowed tokens are not counted. Coingecko is used to price tokens.',
    hallmarks: [
        [1635940800, "SLND launch"]
    ]
}
