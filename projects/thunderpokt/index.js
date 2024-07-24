const sdk = require('@defillama/sdk');

const tPOKT = '0x5430a0B6C11f870571ffA891d59dec8C4608Ea9A'

async function tvl(timestamp, ethBlock, chainBlocks) {
  const block = chainBlocks.polygon;
    const tPOKTSupply = (
      await sdk.api.abi.call({
        target: tPOKT,
        abi: 'erc20:totalSupply',
        block,
        chain: 'polygon'
      })
    ).output
    
    let usdPOKTamount = {"pocket-network": tPOKTSupply / 10**6 }

    return usdPOKTamount
}


module.exports = {
	methodology: 'tPOKT is backed 1:1 by POKT. Total supply of tPOKT is pulled and multiplied by POKT price to get the TVL',
	pokt: {
        tvl
    }
}