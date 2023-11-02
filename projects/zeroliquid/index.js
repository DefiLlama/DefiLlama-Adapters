const { staking } = require('../helper/staking')
const  ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

const wstETH ="0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0"
const rETH= "0xae78736cd615f374d3085123a210448e74fc6393"
const sfrxETH= "0xac3E018457B222d93114458476f3E3416Abbe38F"
const swETH= "0xf951e335afb289353dc249e82926178eac7ded78"
const unshETH= "0x0ae38f7e10a43b5b2fb064b42a2f4514cba909ef"


const endpoint = 'https://api.thegraph.com/subgraphs/name/zackzeroliquid/zeroliquid'

const query = `query {
  zeroLiquids {
    amountRETH
    amountSfrxETH
    amountWstETH
    amountSwETH
    amountUnshETH
  }
}`

async function tvl(_, _1, _2, { api }) {
  const data = await fetch(endpoint,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        query,
      }),
    },
  )
    .then((r) => r.json())
    .then((data) => {
      return data.data.zeroLiquids[0];
    });

  api.add(wstETH, data.amountWstETH)
  api.add(rETH, data.amountRETH)
  api.add(sfrxETH, data.amountSfrxETH)
  api.add(swETH, data.amountSwETH)
  api.add(unshETH, data.amountUnshETH)

}



module.exports = {
  methodology: 'Value of LSD tokens in the vault',
  ethereum: {
    tvl: sumTokensExport({
      owner: '0x0246e28C6B161764492E54CBF852e28A4DA2D672',
      tokens: [ADDRESSES.ethereum.WSTETH, ADDRESSES.ethereum.RETH, ADDRESSES.ethereum.sfrxETH, ADDRESSES.ethereum.swETH, ADDRESSES.ethereum.unshETH],
    }),
    staking: staking("0xb9b2d7a712402acb37a97f0ea6356ff271e065e2", '0xb0ed33f79d89541dfdcb04a8f04bc2c6be025ecc')
  }
}; 

