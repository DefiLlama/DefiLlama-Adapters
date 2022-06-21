const {sumTokensAndLPsSharedOwners} = require('../helper/unwrapLPs')
const sdk = require('@defillama/sdk')

const deversifiStarkAddr = '0x5d22045daceab03b158031ecb7d9d06fad24609b';
const listedTokens = [
  '0xdac17f958d2ee523a2206206994597c13d831ec7',
  '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  '0xd26114cd6EE289AccF82350c8d8487fedB8A0C07',
  '0x940a2db1b7008b6c776d4faaca729d6d4a4aa551',
  '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e',
  '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
  '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
  '0xe41d2489571d322189246dafa5ebde1f4699f498',
  '0xcc80c051057b774cd75067dc48f8987c4eb97a5e',
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  '0x419d0d8bdd9af5e606ae2232ed285aff190e711b',
  '0x93ed3fbe21207ec2e8f2d3c3de6e058cb73bc04d',
  '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e',
  '0xba100000625a3754423978a60c9317c58a424e3d',
  '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
  '0xc00e94cb662c3520282e6f5717214004a7f26888',
  '0xec67005c4e498ec7f55e092bd1d35cbc47c91892',
  '0x0d8775f648430679a709e98d2b0cb6250d2887ef',
  '0x514910771af9ca656af840dff83e8264ecf986ca',
  '0x93ed3fbe21207ec2e8f2d3c3de6e058cb73bc04d',
  '0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f',
  '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
  '0xeef9f339514298c6a857efcfc1a762af84438dee',
  '0xa117000000f279d81a1d3cc75430faa017fa5a2e',
  '0x1494ca1f11d487c2bbe4543e90080aeba4ba3c2b',
  '0xf650c3d88d12db855b8bf7d11be6c55a4e07dcc9',
  '0x5a98fcbea516cf06857215779fd812ca3bef1b32',
  '0xdddddd4301a082e62e84e43f474f044423921918',
  '0xaaaebe6fe48e54f431b0c390cfaf0b017d09d42d',
  '0x6b3595068778dd592e39a122f4f5a5cf09c90fe2',
  '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0',
  '0x0a0e3bfd5a8ce610e735d4469bc1b3b130402267',
  '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE',
  '0xD533a949740bb3306d119CC777fa900bA034cd52',
  '0x03ab458634910aad20ef5f1c8ee96f1d6ac54919',
  '0x0391d2021f89dc339f60fff84546ea23e337750f',
  '0x2e9d63788249371f1dfc918a52f8d799f4a38c94',
  '0x33349b282065b0284d756f0577fb39c158f935e6',
  '0x767fe9edc9e0df98e07454847909b5e959d7ca0e',
  '0x25f8087ead173b73d6e8b84329989a8eea16cf73',
  '0xdddd0e38d30dd29c683033fa0132f868597763ab'
];
const weth = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
const aust = "0xa8De3e3c934e2A1BB08B010104CcaBBD4D6293ab"

async function tvl(timestamp, ethBlock){
    const balances = {}
    await sumTokensAndLPsSharedOwners(balances, listedTokens.map(t=>[t, false]), [deversifiStarkAddr], ethBlock)
    const eth = await sdk.api.eth.getBalance({
        target: deversifiStarkAddr,
        block: ethBlock
    })
    const austBalance = await sdk.api.abi.call({
        target: aust,
        params: deversifiStarkAddr,
        abi: 'erc20:balanceOf',
        block: ethBlock
    })
    sdk.util.sumSingleBalance(balances, weth, eth.output)
    sdk.util.sumSingleBalance(balances, 'anchorust', austBalance.output / 1e18)
    return balances
}

module.exports = {
    methodology: `Counts the tokens on ${deversifiStarkAddr}`,
    ethereum: {
      tvl
    }
}
