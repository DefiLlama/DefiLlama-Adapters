const ADDRESSES = require('../helper/coreAssets.json')
const stakingContractAddress = '0xAB8c9Eb287796F075C821ffafBaC5FeDAa4604d5';
const testAuctionContractAddress = '0xe619F1DF06EeaAF443dFC5c09cc96e2C7C91d130';

async function tvl(api) {
  const tokens = await api.call({ abi: 'address[]:getRegisteredTokens', target: stakingContractAddress })
  const vTokens = await api.multiCall({ abi: 'function getRegisteredVToken(address) view returns (address)', calls: tokens, target: stakingContractAddress })
  await api.sumTokens({ owners: [stakingContractAddress, testAuctionContractAddress], tokens: vTokens.concat(tokens).concat([ADDRESSES.null]) });
}

module.exports = {
  bsc: {
    tvl,
  },
}
