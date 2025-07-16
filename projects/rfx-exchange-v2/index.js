const { sumTokens2 } = require('../helper/unwrapLPs')

async function tvl(api) {
  // USN Vault market addresses
  const owners = [
    "0x4B1ef8Eb333FAE7CdaEc847475CC47bcDB70bF3f",
    "0xBA06793bb5E3495c54330F5c5400C9AD14443586",
    "0x57ff14bD78d4B9B14E9aEC6e1D5d580d5DCa86ED",
    "0x0b4D1d74890a860a7a3dF7769114bCeA7AA8B713",

    // USN vault address
    "0x233122C668f6433c0ee5C47A003EEf81c1cc972c"
  ]

  // USN address
  const tokens = [
    '0x0469d9d1dE0ee58fA1153ef00836B9BbCb84c0B6',
  ]
  return sumTokens2({ api, owners, tokens})
}

async function tvlSonic(api) {
  // wS and scUSD vault market addresses
  const owners = [
    "0x892329709aA1d21e20f7999A04f93174D8f1a347",
    "0xab81DF4b5622dF20F0A00Ef6f2e13DA41b8cdF2E",
    "0xA9919fe44a21604DeB4e0F891cBF2fA9529B6089",
    "0x393D97Fa698a82e274142a9b505699938b04067d",
    "0xCA99e05127700F2C0ffe7e080393485975dB819f",
    "0xC990A9b2A4C48d5fFAF957D32a6AE85383C0Ed61",
    "0xfb28B0896EC4e9927B0d661925D5BF8bC4b93D50",
    "0xd9dDe4503f2ab7Ef4064bD5469210BBa8C2Afc96",
    "0xb3B983b58f380AD0D2EB2A1C37de1Eafe336da8E",
    "0x4e8477aFCBFfb6efC368826f87b9902EDcfE26a7",
    "0x0F51061Db8938819508e4F298505f1d5145354Ce",
    "0xa5252989E139BE0bAC2AAb54Fd5905513f157d92",
    "0x36F602F500af944063914f888Ea66Ae6C2ec1E60",
    "0x6228bEdBf24CFF72cD82494B5B490b3cEdb599bC",
    "0x4e662Ed833717e0970a4f5c516A11De685d26478",
    "0x14E760f03a0D720c69153F5Ee9A03E3572CC49d6",
    "0xCA259051Ace62E4e5ffCd1886f74e5A23790BF2C",
    "0x287C297e280c27beb492B4Cd40B1d26F82d4efB9",
    "0xf34694ECAe92D40773A2f078e42cE583365EE527",
    "0xA447ad29cD24f2f4207b7523C2F666CC7cc28A78",

    // wS and scUSD vaults
    "0x13919E105668792AB630148b03D6b91FF6df0491",
    "0x0bfFb867472cdaE11D0A10020Ab9a9d9Fdf6193b"
  ]

  // wS and scUSD address
  const tokens = [
    '0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38',
    '0xd3DCe716f3eF535C5Ff8d041c1A41C3bd89b97aE',
  ]
  return sumTokens2({ api, owners, tokens})
}

module.exports = {
  era: {
    tvl,
  },
  sonic: {
    tvl: tvlSonic,
  },
  methodology: `Counts the total liquidity allocated by the RFX v2 Smart Liquidity Vaults`,
};
