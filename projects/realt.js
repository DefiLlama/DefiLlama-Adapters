const sdk = require("@defillama/sdk")
const retry = require('./helper/retry')
const axios = require("axios")
const BigNumber = require("bignumber.js")

// Get supply for token (from xdai or mainnet)
async function getSupply(token, contractChain) {
  const contract = token[contractChain]
  if (contract === null) {
    return new BigNumber(0)
  }
  // URL from scanner depends on contract chain
  let url
  if (contractChain === 'ethereumContract') {
    url = 'https://api.etherscan.io/api?module=stats&action=tokensupply&contractaddress=' + contract + '&apikey=H6NGIGG7N74TUH8K2X31J1KB65HFBH2E82'
  }
  else if (contractChain === 'xDaiContract') {
    url = 'https://blockscout.com/xdai/mainnet/api?module=stats&action=tokensupply&contractaddress=' + contract
  }
  // Once URL built, parse response with 18 decimals
  const response = await retry(async bail => await axios.get(url))
  const supply = new BigNumber(response.data.result).div(10 ** 18)
  return supply
}

// Loop through all RealT tokens listed by realt.community API and accumulate tokenprice * supply, where supply is biggest of xdai or mainnet
// See https://api.realt.community/ for reference
const xdai_usdc = 'xdai:0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83'
async function xdaiTvl(timestamp, block, chainBlocks) {
  let realt_tokens = await retry(async bail => await axios.get('https://api.realt.community/v1/token'))
  realt_tokens = realt_tokens.data

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
      'propertyPrice': BigNumber(supply.output).div(1e18).times(BigNumber(token['tokenPrice']))
    }
  })

  // Accumulate to TVL in USD and log
  let tvl = tokenProperties.reduce(
    (acc, token) => acc.plus(BigNumber(token['propertyPrice'])), 
    BigNumber(0)
  ) 
  tvl = tvl.times(1e6).toFixed(0)
  console.log('Realt TVL:', tvl)
  return {[xdai_usdc]: tvl}
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