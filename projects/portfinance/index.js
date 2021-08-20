const {getTokenBalance} = require('../helper/solana')

async function tvl() {
    const [usdcAmount, usdtAmount, solAmount, paiAmount, merAmount, btcAmount, srmAmount] = await Promise.all([
        getTokenBalance("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", "2xPnqU4bWhUSjZ74CibY63NrtkHHw5eKntsxf8dzwiid"),
        getTokenBalance("Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", "QyvfrbqH7Mo8W5tHN31nzbfNiwFwqPqahjm9fnzo5EJ"),
        getTokenBalance("So11111111111111111111111111111111111111112", "BLAFX12cDmsumyB6k3L6whJZqNqySaWeCmS5rVuzy3SS"),
        getTokenBalance("Ea5SjE2Y6yvCeW5dYTn7PYMuW5ikXkvbGdcmSnXeaLjS", "42kNZrAuwZHLtuc7jvVX7zMfkfgwbPynqzFB3zdkAEGM"),
        getTokenBalance("MERt85fc5boKw3BW1eYdxonEuJNvXbiMbs6hvheau5K", "6UmrawFZgdPvMe6BLZdZCNRFz9u2TWsu5enFbTufA3a1"),
        getTokenBalance("9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E", "FZKP27Zxz9GbW86hhq3d1egzpBH5ZnYkyjQZVf86NQJ8"),
        getTokenBalance("SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt", "DjhMNdgdbxNud1gmc4DUwrQqJxNbjhxiwNnhc4usSXmQ"),
    ])
    return {
        'usd-coin': usdcAmount,
        'tether': usdtAmount,
        'solana': solAmount,
        'usdp': paiAmount,
        'mercurial': merAmount,
        'bitcoin': btcAmount,
        'serum': srmAmount,
    }
}

module.exports = {
    tvl
};
