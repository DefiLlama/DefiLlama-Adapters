const abi = require('./abi.json')
const { staking } = require('../helper/staking');

const oldRegistry = "0x3228f22d98d81A859aCC9890c3874FfF864a8Bd4";
const newRegistry = "0x18bf8A3eE39Be5730189A0C88D90f744e3c55B20";
const vault_role = "0x0e2208c692f4f271957e6c9d7c9785b7c2c3a7e329d54eecdfaa3c5f48b0cd51";
const lixirToken = "0xd0345D30FD918D7682398ACbCdf139C808998709";

async function ethTvl(api) {
  await vaultTvl(oldRegistry, api);
  await vaultTvl(newRegistry, api)
}

async function vaultTvl(registry, api) {
  const count = await api.call({ abi: abi.getRoleMemberCount, target: registry, params: vault_role })
  const calls = []
  for (let i = 0; i < count; i++)
    calls.push({ params: [vault_role, i] })


  const vaults = await api.multiCall({ abi: abi.getRoleMember, target: registry, calls, })
  const token0s = await api.multiCall({ abi: abi.token0, calls: vaults })
  const token1s = await api.multiCall({ abi: abi.token1, calls: vaults })
  const totals = await api.multiCall({ abi: abi.calculateTotals, calls: vaults })

  for (let i = 0; i < count; i++) {
    api.add(token0s[i], totals[i].total0)
    api.add(token1s[i], totals[i].total1)
  }
}

module.exports = {
  doublecounted: true,
  ethereum: {
    tvl: ethTvl,
    staking: staking("0x29adccf67821e9236b401df02080bac67f84192d", lixirToken)
  }
}