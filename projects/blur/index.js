const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk')
const {staking} = require('../helper/staking')


const blurBiddingAddr = "0x0000000000A39bb272e79075ade125fd351887Ac"


async function ethtvl(timestamp, block) {
 
  const ethBalance = await sdk.api.eth.getBalance({
    target: blurBiddingAddr,
    block
  })

  return {
    [ADDRESSES.null]: ethBalance.output,
    
  }
}

module.exports = {
   hallmarks: [
    [1676376000,"BLUR token launch"]
  ],
            methodology: 'TVL counts ETH tokens in the Blur Bidding address:0x0000000000A39bb272e79075ade125fd351887Ac',
    
    ethereum: {
        staking: staking("0xeC2432a227440139DDF1044c3feA7Ae03203933E", "0x5283d291dbcf85356a21ba090e6db59121208b44"),
        tvl: ethtvl
    }
}
