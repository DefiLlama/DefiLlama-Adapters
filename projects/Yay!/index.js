const yayStoneAddress = '0xe86142af1321eaac4270422081c1EdA31eEcFf0c'
const yayAgETHAddress = '0x0341d2c2CE65B62aF8887E905245B8CfEA2a3b97'

const yayStoneOFTAdapterAddress = '0x4b18d95B3CA275AdaD67F1dC81c0FE0D1FB58d59'
const yayAgEthOFTAdapterAddress = '0xA8ab83461e443f4a24613C1EFB7D1C653F95dD4C'

const eth = async (api) => {
  // original balances
  const balances = await api.sumTokens({
    tokensAndOwners: [
      ['0x7122985656e38bdc0302db86685bb972b145bd3c', yayStoneAddress],
      ['0xe1b4d34e8754600962cd944b535180bd758e6c2e', yayAgETHAddress],
    ],
  })

  // bridged balances
  const bridgedYayStoneBals = await api.call({
    target: yayStoneAddress,
    params: [yayStoneOFTAdapterAddress],
    abi: 'erc20:balanceOf',
  })

  const bridgedYayAgEthBals = await api.call({
    target: yayAgETHAddress,
    params: [yayAgEthOFTAdapterAddress],
    abi: 'erc20:balanceOf',
  })

  // deduct bridged balances
  balances["ethereum:0x7122985656e38bdc0302db86685bb972b145bd3c"] = balances["ethereum:0x7122985656e38bdc0302db86685bb972b145bd3c"] - bridgedYayStoneBals
  balances["ethereum:0xe1b4d34e8754600962cd944b535180bd758e6c2e"] = balances["ethereum:0xe1b4d34e8754600962cd944b535180bd758e6c2e"] - bridgedYayAgEthBals


  return balances;
}

const soneium = async (api) => {
  // bridged balances
  const bridgedYayStoneBals = await api.call({
    target: "0x54e86315C03217b76A7466C302245fD10ebEf25A",
    abi: 'erc20:totalSupply',
  })

  const bridgedYayAgEthBals = await api.call({
    target: "0xda14b3B7aEF494b8c37ed9710d14e44D490316fa",
    abi: 'erc20:totalSupply',
  })

  const wastrBals = await api.call({
    target: "0xc8809C9f811324F4c196eb44C20555D4663Aa6c0",
    abi: 'erc20:totalSupply',
  })

  const vastrBals = await api.call({
    target: "0xea7Cf5C2D2509f7A4281F6E8378eaC30420f4206",
    abi: 'erc20:totalSupply',
  })

  const balances = {
    "ethereum:0x7122985656e38bdc0302db86685bb972b145bd3c": bridgedYayStoneBals,
    "ethereum:0xe1b4d34e8754600962cd944b535180bd758e6c2e": bridgedYayAgEthBals,
    "soneium:0x2CAE934a1e84F693fbb78CA5ED3B0A6893259441": wastrBals,
    "astar:0xfffFffff00000000000000010000000000000010": vastrBals,
  }

  return api.addBalances(balances)

  // console.log(await api.getBalancesV2())
  // console.log(await api.getUSDValue())

  // return balances;
}

module.exports = {
  start: 1722488340,
  ethereum: { tvl: eth },
  soneium: { tvl: soneium },
}