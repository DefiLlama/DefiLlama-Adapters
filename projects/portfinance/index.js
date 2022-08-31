const { sumTokens2 } = require('../helper/solana')

async function tvl() {
  const tokens = [
    "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
    "So11111111111111111111111111111111111111112",
    "Ea5SjE2Y6yvCeW5dYTn7PYMuW5ikXkvbGdcmSnXeaLjS",
    "MERt85fc5boKw3BW1eYdxonEuJNvXbiMbs6hvheau5K",
    "9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E",
    "SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt",
    "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So",
    "9EaLkQrbjmbbuZG9Wdpo8qfNUEjHATJFSycEmw6f1rGX",
    "Saber2gLauYim4Mvftnrasomsv6NvAuncvMEZwcLpD1",
    "2poo1w1DL6yd2WNTCnNTzDqkC6MBXq7axo77P16yrBuf",
    "9vMJfxuKxXBoEa7rM12mYLMwTacLMLDJqHozw96WQL8i",
    "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs",
    "PoRTjZMPXb9T7dyU7tpLEZRQj7e6ssfAE62j2oQuc6y",
  ]
  const owner = '8x2uay8UgrLiX8AAYyF6AkK9z91nNtN6aLwfqPkf6TAQ'

  return sumTokens2({ owner, tokens })
}

module.exports = {
  timetravel: false,
  solana: {
    tvl
  }
};
