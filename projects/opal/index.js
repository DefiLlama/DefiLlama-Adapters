
const abi = require("./abi.json");
const {toUSDTBalances} = require('../helper/balances')
const sdk = require("@defillama/sdk");

const Omnipools = [
  // wstETH
  "0x86b130298719F753808E96cA6540b684a2d21466",
  // rETH
  "0xD2358c5d01065b13F2Ad1107d5a4531Cd98aC7A1",
  // wETH
  "0x0c8e1e97d9f41a21D6Ef98E644a5516d9b7F593f",
  // weETH
  "0x2165AEA91B33631A772d1723b88a98C1Ca820116",
  // USDC
  "0x4aCc76B4B3E4529D7cE88Ca921D7a4112f25A6dA"
];

const Oracle = '0x40ebec5155c889fe01d6f7f16c3824c23d3b43ea'

async function tvl(_, _b, _cb, { api, }) {
  // Fetch each omnipool's underlying pools length so we can iterate through them
  const underlyingPoolsLength = (await api.multiCall({
    abi: abi.underlyingPoolsLength, calls: Omnipools
  })).map(i => parseInt(i))

  // Build a `template` request for each pool, which the correct amount of underlying pools
  const reqBuilder = underlyingPoolsLength.map((underlyingPools, poolIndex) => [...new Array(underlyingPools)])
  const poolsCalls = reqBuilder.map((items, poolIndex) => items.map((item, index) => ({ target: Omnipools[poolIndex], params: [index] })))

  // Fetch each pool's underlying pools
  const bptAddresses = (await api.multiCall({
    abi: abi.getUnderlyingPool, calls: poolsCalls.flat()
  }))

  // Fetch each pool's bpt valuation
  const bptValuations = (await api.multiCall({
    abi: abi.getBptValuation, calls: poolsCalls.flat()
  }))

  let offset = 0
  // Build a request for each pool's underlying pools balances
  const bptCalls = []
  for (let i = 0; i < reqBuilder.length; i++) {
    const addresses = bptAddresses.slice(offset, reqBuilder[i].length + offset)
    offset += addresses.length
    for (let address of addresses) bptCalls.push({ target: address, params: [Omnipools[i]] })
  }

  // Request the balances
  const bptBalances = (await api.multiCall({
    abi: 'erc20:balanceOf', calls: bptCalls
  }))

  let totalTvl = 0
  offset = 0
  // Compute the total TVL using the balances and the bpt valuations
  for (let i = 0; i < reqBuilder.length; i++) {
    const tempBalances = bptBalances.slice(offset, reqBuilder[i].length + offset)
    const valuations = bptValuations.slice(offset, reqBuilder[i].length + offset)
    for (let j = 0; j < tempBalances.length; j++) {
      totalTvl += tempBalances[j] / 1e18 * valuations[j] / 1e18
    }
    offset += tempBalances.length
  }

  return toUSDTBalances(totalTvl)
}

module.exports = {
  misrepresentedTokens: true,
  ethereum: { tvl },
  methodology: "Compute the total TVL by summing the balances of each pool's underlying pools and multiplying by the BTP valuation",
};
