const ADDRESSES = require('./helper/coreAssets.json')
const { get } = require('./helper/http')

// Loop through all RealT tokens listed by realt.community API and accumulate tokenprice * supply, where supply is biggest of xdai or mainnet
// See https://api.realt.community/ for reference
async function xdaiTvl(api) {
  let realt_tokens = await get('https://api.realt.community/v1/token')

  // Filter out deprecated contracts
  realt_tokens = realt_tokens.filter(t => !t['fullName'].startsWith('OLD-')).filter(t => t.xDaiContract && +t.tokenPrice)

  const tokenSupplies_xdai = await api.multiCall({ calls: realt_tokens.map(t => t.xDaiContract), abi: 'erc20:totalSupply', })
  tokenSupplies_xdai.map((supply, i) => api.add(ADDRESSES.xdai.USDC, supply/1e18 * realt_tokens[i]['tokenPrice'] * 1e6 ))
}

module.exports = {
  methodology: `TVL for RealT consists of the accumulation of all properties prices, each being tokenSupply * tokenPrice where tokenPrice is given by community API`,
  xdai: {
    tvl: xdaiTvl
  },
}


/*
A token looks like below as returned by community API
{
  fullName	"19191 Bradford Ave, Detroit, MI 48205"
  shortName	"19191 Bradford"
  symbol	"REALTOKEN-S-19191-BRADFORD-AVE-DETROIT-MI"
  tokenPrice	54.04
  currency	"USD"
  ethereumContract	"0x584967356bad1499c10a8695522983F2fB7d88F3"
  xDaiContract	"0x584967356bad1499c10a8695522983F2fB7d88F3"
  lastUpdate	
  date	"2021-10-17 20:00:01.000000"
  timezone_type	3
  timezone	"UTC"
}
*/
