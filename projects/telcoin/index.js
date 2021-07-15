const sdk = require('@defillama/sdk');


const lpAdresses = [
  '0xa5cabfc725dfa129f618d527e93702d10412f039';  //USDC
  '0xe88e24f49338f974b528ace10350ac4576c5c8a1';  //QUICK
  '0xfc2fc983a411c4b1e238f7eb949308cf0218c750';  //WETH
  '0x9b5c71936670e9f1f36e63f03384de7e06e60d2a';  //WMATIC
  '0x4917bc6b8e705ad462ef525937e7eb7c6c87c356';  //AAVE
  '0xaddc9c73f3cbad4e647eaff691715898825ac20c';  //WBTC
  ];

async function tvl(timestamp, block) {
  let balances = [];
  
  let polygonBalances = await sdk.api.abi.multiCall({
    calls: lpAdresses,
    abi: 'erc20:balanceOf',
    block,
    chain: 'polygon'                  
  });
  balances.push(polygonBalances);
  return balances;
  }
  

module.exports = {
  ethereum:{
    tvl,
  },
  tvl
}
