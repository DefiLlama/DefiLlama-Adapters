const ADDRESSES = require('./helper/coreAssets.json')
const sdk = require("@defillama/sdk")
const { getConfig } = require('./helper/cache')

// Loop through all RealT tokens listed by realt.community API and accumulate tokenprice * supply, where supply is biggest of xdai or mainnet
// See https://api.realt.community/ for reference
const xdai_usdc = 'xdai:' + ADDRESSES.xdai.USDC
async function xdaiTvl(timestamp, block, chainBlocks) {
  let realt_tokens = await getConfig('realt', 'https://api.realt.community/v1/token')

  // Filter out deprecated contracts
  realt_tokens = realt_tokens.filter(t => !t['fullName'].startsWith('OLD-'))
  // realt_tokens = realt_tokens.slice(0,5)

  const calls_xdai = realt_tokens.map((token) => ({
    target: token['xDaiContract'],
  })).filter(t => t.target)

  const tokenSupplies_xdai = (
    await sdk.api.abi.multiCall({
      calls: calls_xdai,
      abi: 'erc20:totalSupply',
      block: chainBlocks['xdai'],
      chain: 'xdai'
    })
  ).output

  const tokenProperties = tokenSupplies_xdai.map((supply) => {
    const tokenContract = supply.input.target
    const token = realt_tokens.find(t => t['xDaiContract'] === tokenContract)
    return {
      'contract': tokenContract,
      'supply': supply.output,
      'tokenPrice': token['tokenPrice'],
      'propertyPrice': (supply.output / 1e18) * token['tokenPrice']
    }
  })

  // Accumulate to TVL in USD and log
  let tvl = tokenProperties.reduce((acc, token) => acc + token.propertyPrice, 0)
  return { [xdai_usdc]: tvl * 1e6 }
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
