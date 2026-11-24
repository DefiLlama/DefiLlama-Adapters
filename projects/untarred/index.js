const ADDRESSES = require('../helper/coreAssets.json')

const { USDG } = ADDRESSES.robinhood

// VaultFund shares are 18 decimals; lastNav is USDG-per-share with 18 decimals ($1 = 1e18).
// AUM in USDG (6 decimals) = totalSupply * lastNav / 1e30.
const FUNDS = [
  '0x9319364EdDbE1F58EaD4B9ba2EeF0f91A9c9CD30', // uYLD
  '0x7e059E67F50ab876433Ab1F9AcB0CAF836697543', // uCMD
  '0xd8CE7a92934c72B53b5aBf1476af1ac245BcEd62', // uSTK
]
const EARN = '0x96f37De93F012fea289a31b9362FBe4F8f075413'

async function tvl(api) {
  const [supplies, navs, earnAssets] = await Promise.all([
    api.multiCall({ abi: 'uint256:totalSupply', calls: FUNDS }),
    api.multiCall({ abi: 'uint256:lastNav', calls: FUNDS }),
    api.call({ abi: 'uint256:totalAssets', target: EARN }),
  ])

  let aum = 0n
  for (let i = 0; i < FUNDS.length; i++) {
    aum += (BigInt(supplies[i]) * BigInt(navs[i])) / 10n ** 30n
  }
  api.add(USDG, aum + BigInt(earnAssets))
}

module.exports = {
  methodology:
    'TVL is Untarred vault-fund AUM (uYLD, uCMD, uSTK) as totalSupply × lastNav, plus Untarred Earn totalAssets(). Fund NAV is the on-chain marked book value of cash and hedged positions (including Lighter equity), not open-interest notional.',
  start: '2026-11-13',
  robinhood: { tvl },
}
