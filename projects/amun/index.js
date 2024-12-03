const solana = require('../helper/solana');

async function tvl(api) {
  return solana.sumTokens2({ tokenAccounts: ['GprM9vgGpUbNU4N5SbDAigL1JYCvQiDop28cmEQ7Bw2w'] })
}

module.exports = {
  deadFrom: '2023-03-22',
  timetravel: false,
  ethereum: { tvl: () => ({}), },
  polygon: { tvl: () => ({}), },
  solana: { tvl, },
  hallmarks: [
    [Math.floor(new Date('2023-03-22') / 1e3), 'Project is sunset!'],
    [Math.floor(new Date('2022-12-26') / 1e3), 'Hacked for 300k!'],
  ],
  methodology: `Amun Tokens has three investment strategies available, which are the Defi Token Index(DFI), the Polygon Ecosystem Index (PECO) and Solana Ecosystem Index (SOLI). Each strategy has its own address where the underlying tokens are held. To get the TVL for the DFI and PECO, first of all, an on-chain call is made using the function 'tvl()', which first retrieves each token that is held within the strategy addresses and then calls 'balanceOf()' to get the balances of these tokens which are added and used as TVL. For SOLI, getTokenSupply helper method is called to get the total supply of the token, and then multiplied at the current market rate of the token, retrieved from our API endpoint.`,
};
