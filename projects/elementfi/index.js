const sdk = require("@defillama/sdk");
const abi = require('./abi.json');
const bn = require('bignumber.js')
const { getLogs } = require('../helper/cache/getLogs')

const trancheFactoryAddress = "0x62F161BF3692E4015BefB05A03a94A40f520d1c0";
const ccpFactory = '0xb7561f547F3207eDb42A6AfA42170Cd47ADD17BD';
const balVault = '0xBA12222222228d8Ba445958a75a0704d566BF2C8'

const wps = [
  '0xD5D7bc115B32ad1449C6D0083E43C87be95F2809',
  '0xDe620bb8BE43ee54d7aa73f8E99A7409Fe511084',
  '0x67F8FCb9D3c463da05DE1392EfDbB2A87F8599Ea',
  '0xF94A7Df264A2ec8bCEef2cFE54d7cA3f6C6DFC7a',
  '0xE54B3F5c444a801e61BECDCa93e74CdC1C4C1F90',
  '0x2D6e3515C8b47192Ca3913770fa741d3C4Dac354',
  '0xd16847480D6bc218048CD31Ad98b63CC34e5c2bF',
  '0x7320d680Ca9BCE8048a286f00A79A2c9f8DCD7b3',
  '0x9e030b67a8384cbba09D5927533Aa98010C87d91'
]

async function tvl(api) {
  let balances = {};
  const block = api.block

  const tranches = (await getLogs({
    target: trancheFactoryAddress,
    topic: 'TrancheCreated(address,address,uint256)',
    fromBlock: 12685765, api
  })).map(i => `0x${i.topics[1].substr(-40).toLowerCase()}`)
  const underlying = await api.multiCall({
    abi: abi['underlying'],
    calls: tranches,
  })
  const valueSupplied = await api.multiCall({
    abi: abi['valueSupplied'],
    calls: tranches,
  })
  underlying.forEach((t, i) => sdk.util.sumSingleBalance(balances, t, valueSupplied[i]))


  // wp tvl
  await Promise.all(wps.map(async wp => {
    try {
      let poolId = (await sdk.api.abi.call({
        block,
        target: wp,
        abi: abi['getPoolId'],
      })).output;

      let poolTokens = (await sdk.api.abi.call({
        block,
        target: balVault,
        abi: abi['getPoolTokens'],
        params: poolId
      })).output;
      const names = await api.multiCall({ abi: 'string:name', calls: poolTokens.tokens })
      for (let i = 0; i < poolTokens.tokens.length; i++) {
        let token = poolTokens.tokens[i];
        if (names[i].startsWith('Element Yield Token'))
          return;

        balances[token.toLowerCase()] = balances[token.toLowerCase()] ? new bn(balances[token.toLowerCase()]).plus(poolTokens.balances[i]) : poolTokens.balances[i];
      }
    } catch (e) {
      sdk.log(e)
    }

  }))

  // // // cc tvl
  let cc = (await getLogs({
    api,
    target: ccpFactory,
    fromBlock: 12686198,
    topic: 'PoolCreated(address)',
  })).map(i => `0x${i.topics[1].substr(-40)}`);

  await Promise.all(cc.map(async i => {
    const poolId = await api.call({
      target: i,
      abi: abi['getPoolId'],
    })
    const poolTokens = await api.call({
      target: balVault,
      abi: abi['getPoolTokens'],
      params: poolId
    })

    for (let i = 0; i < poolTokens.tokens.length; i++) {
      let token = poolTokens.tokens[i];
      if (tranches.indexOf(token.toLowerCase()) >= 0) {
        continue;
      }
      sdk.util.sumSingleBalance(balances, token, poolTokens.balances[i])
    }
  }))

  return balances;
}
module.exports = {
  ethereum: { tvl },
};