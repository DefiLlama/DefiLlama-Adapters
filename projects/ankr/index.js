const sdk = require('@defillama/sdk');

const wethAddress = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'

const tokenAddresses = [
  ["0xE95A203B1a91a908F9B9CE46459d101078c2c3cb", wethAddress], // eth
  ["0x99534ef705df1fff4e4bd7bbaaf9b0dff038ebfe", "0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0"], // matic
  ["0x5cc56c266143f29a5054b9ae07f3ac3513a7965e", "bsc:0x7083609fce4d1d8dc0c979aab8c869ea2c873402"], // dot
  ["0x84da8e731172827fcb233b911678e2a82e27baf2", "kusama"]// ksm
];

async function tvl(timestamp, block) {
  const balances = {}
  for (const address of tokenAddresses) {
    const supply = await sdk.api.erc20.totalSupply({
      target: address[0],
      block
    })
    if(address[1]==="kusama"){
      supply.output=Number(supply.output)/1e18
    }
    sdk.util.sumSingleBalance(balances, address[1], supply.output)
  }

  return balances
}

module.exports = {
  ethereum: {
    tvl,
  },
  methodology: `We get the total supply of aETHc, the ETH staking contract and convert it to USD.`
}
