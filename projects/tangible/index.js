const sdk = require('@defillama/sdk');
const { getParamCalls } = require('../helper/utils')

const {apGetAddress, getPriceManager, getCategories,
    getTreasuryValue, getTotalSupply, getTokenByIndex, getTnftCustody,
    getItemPriceBatchTokenIds} = require("./abi.js");

const ADDRESS_PROVIDER_ADDRESS = "0xE95BCf65478d6ba44C5F57740CfA50EA443619eA";
const FACTORY_ADDRESS = "0xB0E54b88BB0043A938563fe8A77F4ddE2eB0cFc0";
const chain = 'polygon'

async function tvl(_, _b, {polygon: block}) {
  //get all needed addresses
  const priceManagerAddress = (await sdk.api.abi.call({
    abi: getPriceManager,
    target: FACTORY_ADDRESS,
    chain, block,
  })).output

  // we itterate through these to get prices
  const tnftContractsAddresses = (await sdk.api.abi.call({
    abi: getCategories,
    target: FACTORY_ADDRESS,
    chain, block,
  })).output

  //treasury address to get total value in treasury
  const usdrTreasuryAddress = (await sdk.api.abi.call({
    abi: apGetAddress,
    target: ADDRESS_PROVIDER_ADDRESS,
    params: ["0xc83e4fd410f80be983b083c99898391186b0893751a26a9a1e5fdcb9d4129701"],//keccak of USDRTreasury
    chain, block,
  })).output

  //underlying to get decimals 
  const underlyingAddress = (await sdk.api.abi.call({
    abi: apGetAddress,
    target: ADDRESS_PROVIDER_ADDRESS,
    params: ["0xadbe96ac53cb4ca392e9ee5a7e23c7d7c8450cb015ceaad4d4677fae1c0bb1a4"], //keccak of underlying
    chain, block,
  })).output

  //first get total treasury value
  // it is in underlyting token, and that is currently DAI 18 decimals
  const totalTreasuryValue = (await sdk.api.abi.call({
    abi: getTreasuryValue,
    target: usdrTreasuryAddress,
    chain, block,
  })).output

  //we reduce by these because these amounts are contained in value of tnfts
  let tvl = totalTreasuryValue.total
      - totalTreasuryValue.rwa
      - totalTreasuryValue.rwaEscrow
      - totalTreasuryValue.rwaVaults

  //now we fetch value of all tnfts ever minted
  await Promise.all(tnftContractsAddresses.map(async (tnft) => {
    
    //fetch totalSupply
    const totalSupply = (await sdk.api.abi.call({
      abi: getTotalSupply,
      target: tnft,
      chain, block,
    })).output
    //fetch all token ids
    let ids = [];
    const tokenCalls = getParamCalls(totalSupply)
    const { output: tokenIds } = await sdk.api.abi.multiCall({
      target: tnft,
      abi: getTokenByIndex,
      calls: tokenCalls,
      chain, block,
    })
    const custodyCalls = tokenIds.map(i => ({ params: i.output}))
    const { output: inTangibleCustody } = await sdk.api.abi.multiCall({
      target: tnft,
      abi: getTnftCustody,
      calls: custodyCalls,
      chain, block,
    })

    inTangibleCustody.forEach(({ input: { params: [tokenId] }, output }) => {
      if (output) ids.push(tokenId)
    })

    // now fetch all prices
    const prices = (await sdk.api.abi.call({
      abi: getItemPriceBatchTokenIds,
      target: priceManagerAddress,
      params: [tnft, underlyingAddress, ids],
      chain, block,
    })).output

    for(let i = 0; i < prices.weSellAt.length; i++)
      tvl += +prices.weSellAt[i] + +prices.lockedAmount[i]
    
  }))

  return {
    tether: tvl/1e18
  }
}

module.exports = {
  misrepresentedTokens: true,
  polygon: {
    tvl,
  }
}; 