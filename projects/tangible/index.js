const sdk = require('@defillama/sdk');
const utils = require('../helper/utils');
const { transformPolygonAddress } = require('../helper/portedTokens');

const {apGetAddress, getPriceManager, getCategories,
    getTreasuryValue, getTotalSupply, getTokenByIndex, getTnftCustody,
    getItemPriceBatchTokenIds} = require("./abi.js");
const { token } = require('@project-serum/anchor/dist/cjs/utils');
const { BigNumber, ethers } = require('ethers');

const ADDRESS_PROVIDER_ADDRESS = "0xE95BCf65478d6ba44C5F57740CfA50EA443619eA";
const FACTORY_ADDRESS = "0xB0E54b88BB0043A938563fe8A77F4ddE2eB0cFc0";

async function tvlCalc(timestamp, block, chainBlocks) {
  //get all needed addresses
  const priceManagerAddress = (await sdk.api.abi.call({
    abi: getPriceManager,
    chain: 'polygon',
    target: FACTORY_ADDRESS,
    // params: [],
    block: chainBlocks['polygon'],
  })).output

  // we itterate through these to get prices
  const tnftContractsAddresses = (await sdk.api.abi.call({
    abi: getCategories,
    chain: 'polygon',
    target: FACTORY_ADDRESS,
    // params: [],
    block: chainBlocks['polygon'],
  })).output


  //treasury address to get total value in treasury
  const usdrTreasuryAddress = (await sdk.api.abi.call({
    abi: apGetAddress,
    chain: 'polygon',
    target: ADDRESS_PROVIDER_ADDRESS,
    params: ["0xc83e4fd410f80be983b083c99898391186b0893751a26a9a1e5fdcb9d4129701"],//keccak of USDRTreasury
    block: chainBlocks['polygon'],
  })).output

  //underlying to get decimals 
  const underlyingAddress = (await sdk.api.abi.call({
    abi: apGetAddress,
    chain: 'polygon',
    target: ADDRESS_PROVIDER_ADDRESS,
    params: ["0xadbe96ac53cb4ca392e9ee5a7e23c7d7c8450cb015ceaad4d4677fae1c0bb1a4"], //keccak of underlying
    block: chainBlocks['polygon'],
  })).output


  //first get total treasury value
  // it is in underlyting token, and that is currently DAI 18 decimals
  const totalTreasuryValue = (await sdk.api.abi.call({
    abi: getTreasuryValue,
    chain: 'polygon',
    target: usdrTreasuryAddress,
    // params: [MINT_CLUB_BOND_CONTRACT],
    block: chainBlocks['polygon'],
  })).output

  //we reduce by these because these amounts are contained in value of tnfts
  let tvl = BigNumber.from(totalTreasuryValue.total)
      .sub(BigNumber.from(totalTreasuryValue.rwa))
      .sub(BigNumber.from(totalTreasuryValue.rwaEscrow))
      .sub(BigNumber.from(totalTreasuryValue.rwaVaults))
  //now we fetch value of all tnfts ever minted
  for (const tnft of tnftContractsAddresses){
    
    //fetch totalSupply
    const totalSupply = (await sdk.api.abi.call({
      abi: getTotalSupply,
      chain: 'polygon',
      target: tnft,
      // params: [MINT_CLUB_BOND_CONTRACT],
      block: chainBlocks['polygon'],
    })).output
    //fetch all token ids
    let ids = [];
    for(let i = 0; i < totalSupply; i++){
      const tokenId = (await sdk.api.abi.call({
        abi: getTokenByIndex,
        chain: 'polygon',
        target: tnft,
        params: [i],
        block: chainBlocks['polygon'],
      })).output
      //fetch status - if not in our custody - it is redeemed
      const inTangibleCustody = (await sdk.api.abi.call({
        abi: getTnftCustody,
        chain: 'polygon',
        target: tnft,
        params: [tokenId],
        block: chainBlocks['polygon'],
      })).output

      if (inTangibleCustody){
        ids.push(tokenId);
      }
    }

    // now fetch all prices
    const prices = (await sdk.api.abi.call({
      abi: getItemPriceBatchTokenIds,
      chain: 'polygon',
      target: priceManagerAddress,
      params: [tnft, underlyingAddress, ids],
      block: chainBlocks['polygon'],
    })).output
    for(let i = 0; i < prices.weSellAt.length; i++){
      tvl = tvl.add(BigNumber.from(prices.weSellAt[i]).add(BigNumber.from(prices.lockedAmount[i])));
    }
  }
  // const result = await utils.fetchURL("https://api.tangible.store/tvl");

  return ethers.utils.formatUnits(tvl, 18);
}

module.exports = {
  fetch:tvlCalc
}; 