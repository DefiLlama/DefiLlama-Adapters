const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/solana')

async function tvl() {

  const tokensAndOwners = [
    /// Main Pool
    [ADDRESSES.solana.USDC, "8x2uay8UgrLiX8AAYyF6AkK9z91nNtN6aLwfqPkf6TAQ"],
    [ADDRESSES.solana.USDT, "8x2uay8UgrLiX8AAYyF6AkK9z91nNtN6aLwfqPkf6TAQ"],
    [ADDRESSES.solana.SOL, "8x2uay8UgrLiX8AAYyF6AkK9z91nNtN6aLwfqPkf6TAQ"],
    ["Ea5SjE2Y6yvCeW5dYTn7PYMuW5ikXkvbGdcmSnXeaLjS", "8x2uay8UgrLiX8AAYyF6AkK9z91nNtN6aLwfqPkf6TAQ"],
    ["MERt85fc5boKw3BW1eYdxonEuJNvXbiMbs6hvheau5K", "8x2uay8UgrLiX8AAYyF6AkK9z91nNtN6aLwfqPkf6TAQ"],
    ["9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E", "8x2uay8UgrLiX8AAYyF6AkK9z91nNtN6aLwfqPkf6TAQ"],
    ["SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt", "8x2uay8UgrLiX8AAYyF6AkK9z91nNtN6aLwfqPkf6TAQ"],
    ["mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So", "8x2uay8UgrLiX8AAYyF6AkK9z91nNtN6aLwfqPkf6TAQ"],
    [ADDRESSES.solana.pSOL, "8x2uay8UgrLiX8AAYyF6AkK9z91nNtN6aLwfqPkf6TAQ"],
    ["Saber2gLauYim4Mvftnrasomsv6NvAuncvMEZwcLpD1", "8x2uay8UgrLiX8AAYyF6AkK9z91nNtN6aLwfqPkf6TAQ"],
    ["2poo1w1DL6yd2WNTCnNTzDqkC6MBXq7axo77P16yrBuf", "8x2uay8UgrLiX8AAYyF6AkK9z91nNtN6aLwfqPkf6TAQ"],
    ["9vMJfxuKxXBoEa7rM12mYLMwTacLMLDJqHozw96WQL8i", "8x2uay8UgrLiX8AAYyF6AkK9z91nNtN6aLwfqPkf6TAQ"],
    ["7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs", "8x2uay8UgrLiX8AAYyF6AkK9z91nNtN6aLwfqPkf6TAQ"],
    ["PoRTjZMPXb9T7dyU7tpLEZRQj7e6ssfAE62j2oQuc6y", "8x2uay8UgrLiX8AAYyF6AkK9z91nNtN6aLwfqPkf6TAQ"],
    ["7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj", "8x2uay8UgrLiX8AAYyF6AkK9z91nNtN6aLwfqPkf6TAQ"],

    /// Hubble Innovation Zone
    ["USDH1SM1ojwWUga67PGrgFWUHibbjqMvuMaDkRJTgkX", "GU1nCjN7mcLiSX1dtBw2t9agYCw3ybXfu1me41Q2tGT3"],
    ["mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So", "GU1nCjN7mcLiSX1dtBw2t9agYCw3ybXfu1me41Q2tGT3"],
    ["Ea5SjE2Y6yvCeW5dYTn7PYMuW5ikXkvbGdcmSnXeaLjS", "GU1nCjN7mcLiSX1dtBw2t9agYCw3ybXfu1me41Q2tGT3"],
    ["9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E", "GU1nCjN7mcLiSX1dtBw2t9agYCw3ybXfu1me41Q2tGT3"],
    [ADDRESSES.solana.SOL, "GU1nCjN7mcLiSX1dtBw2t9agYCw3ybXfu1me41Q2tGT3"],

    /// UXD Innovation Zone
    ["7kbnvuGBxxj8AG9qp8Scn56muWGaRaFqxg1FsRp3PaFT", "Hy6gCkJyMmWMaoxLyzELRReLzdBdZ1YEjNGjQzF9LDPa"],
    [ADDRESSES.solana.USDC, "Hy6gCkJyMmWMaoxLyzELRReLzdBdZ1YEjNGjQzF9LDPa"],
    [ADDRESSES.solana.USDT, "Hy6gCkJyMmWMaoxLyzELRReLzdBdZ1YEjNGjQzF9LDPa"],
    [ADDRESSES.solana.SOL, "Hy6gCkJyMmWMaoxLyzELRReLzdBdZ1YEjNGjQzF9LDPa"],
    ["mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So", "Hy6gCkJyMmWMaoxLyzELRReLzdBdZ1YEjNGjQzF9LDPa"],

    /// Hedge Innovation Zone
    ["9iLH8T7zoWhY7sBmj1WK9ENbWdS1nL8n9wAxaeRitTa6", "4bf5HQQZ9qtGGCuxYNnhiTrKpTMTX6HSoLy5a7wUjCEb"],
    ["9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E", "4bf5HQQZ9qtGGCuxYNnhiTrKpTMTX6HSoLy5a7wUjCEb"],
    [ADDRESSES.solana.SOL, "4bf5HQQZ9qtGGCuxYNnhiTrKpTMTX6HSoLy5a7wUjCEb"],
    ["mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So", "4bf5HQQZ9qtGGCuxYNnhiTrKpTMTX6HSoLy5a7wUjCEb"],

  ]

  return sumTokens2({ tokensAndOwners })

}

module.exports = {
  timetravel: false,
  solana: {
    tvl
  },
  methodology:
  "To obtain the Port TVL we make on-chain calls using the function getTokenBalance() that uses the address of the token and the address of the contract where the token is located.",

};
