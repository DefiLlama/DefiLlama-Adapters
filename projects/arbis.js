const { staking } = require('./helper/staking')

async function tvl(api) {
  const vaults1 = [
    '0x47a156668F1Ecc659Efbbf4910508Ace1b46a49b',
    '0xdc2d66044e894d0726570bdc03d2123ab8f2cd51',
    '0x5ec477eda75303450a4185b3557c2c2fbb85a9fc',
    '0x69f9a2eF122180366108583F2032DfB2030D8F96',
    '0x374e9F3AFFB6a2c3E388aA69c21D925C193aF13a',
    '0x1922c36f3bc762ca300b4a46bb2102f84b1684ab',
  ]
  const vaults = [
    '0x32e5594F14de658b0d577D6560fA0d9C6F1aa724',
    '0x62FF5Be795262999fc1EbaC29277575031d2dA2C',
    '0x2C5058325373d02Dfd6c08E48d91FcAf8fD49f45',
    '0xE340031b61A394c7811868ef81d2eacc79098BC2',
    '0xF6a37745FC911666132E8b8F29fC9c4F5C4a703D',
    '0xb970E280F9ddAA3349ab9F3ecf778970cDE46655',
  ]

  const tokens = await api.multiCall({  abi: abi.stakedToken, calls: vaults})
  const bals = await api.multiCall({  abi: abi.totalSupply, calls: vaults})
  api.add(tokens, bals)
  const tokens1 = await api.multiCall({  abi: abi.depositToken, calls: vaults1})
  const bals1 = await api.multiCall({  abi: abi.totalDeposits, calls: vaults1})
  api.add(tokens1, bals1)
}

module.exports = {
  arbitrum: {
    tvl,
    staking: staking('0xBf00759D7E329d7A7fa1D4DCdC914C53d1d2db86', '0x9f20de1fc9b161b34089cbeae888168b44b03461')
  }
}

const abi = {
  depositToken: "address:depositToken",
  totalDeposits: "uint256:totalDeposits",
  stakedToken: "address:stakedToken",
  totalSupply: "uint256:totalSupply",
}