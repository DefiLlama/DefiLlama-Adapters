const { staking } = require('../helper/staking')

// Deposits were forwarded by the Treasury contract (0xf7be8476ae27d27ebc236e33020150b23a86f3dd) 
// to the team treasury wallet (treasury() - 0x00236173844ac7f7091d69d6cbf7e0430222296e). 
// reserveBalance() has returned stale ~3.35M since 2023-11-15 and the treasury wallet was emptied 2023-11-28.
// async function tvl(api) {
//   const reserveBalance = await api.call({  abi: 'uint256:reserveBalance', target:  '0xf7be8476ae27d27ebc236e33020150b23a86f3dd'}) 
//   return {
//     tether: reserveBalance / 1e18
//   }
// }

module.exports = {
  misrepresentedTokens: true,
  doublecounted: true,
  deadFrom: '2023-11-28',
  arbitrum: {
    tvl: () => ({}),
    staking: staking('0x25b9f82d1f1549f97b86bd0873738e30f23d15ea', '0xfc77b86f3ade71793e1eec1e7944db074922856e')
  }
}
