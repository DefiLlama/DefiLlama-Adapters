const sdk = require('@defillama/sdk')

async function tvl(ts, block) {    
    const { output } = await sdk.api.erc20.totalSupply({
        target: '0x2acc95758f8b5f583470ba265eb685a8f45fc9d5', 
        chain: 'rsk'
    })
    const totalSupply = output/1e18
    return { 
      'rif-token': totalSupply
    }
  }

module.exports = {
    timetravel: false,
    misrepresentedTokens: true,
    rsk: { tvl }
}