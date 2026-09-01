const unifiETH = '0x196ead472583bc1e9af7a05f860d9857e1bd3dcc'
const pufETH = '0xD9A442856C234a39a81a089C06451EBAa4306a72'

async function tvl(api) {
  const unifiPufEthBalance = await api.call({
    abi: 'erc20:balanceOf',
    target: pufETH,
    params: [unifiETH],
  })

  api.add(pufETH, unifiPufEthBalance)
}

module.exports = {
  doublecounted: true,
  methodology: 'Returns the balance of the Puffer Vault (pufETH) owned by UniFi (unifiETH).',
  ethereum: { tvl }
};
