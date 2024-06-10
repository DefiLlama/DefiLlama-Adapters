const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs');

const tokens = {
  RPG: ADDRESSES.rpg.WRPG,
  // USDT: ADDRESSES.rpg.USDT,
  MIX: '0x36426b7bf5709e5c2160411c6e8b1832e3404fe1',
  AMG: '0xdaa6a6919c9543d8787490f5e9ad532c4d7ce9e8',
  COIN: '0x3978e3cAB1c503eFaD75cB929C7076B7f4f3b6F2',
}

//Dehero的合约
// const deheroContract = [
//   '0x00852E9CDF414D6D9403468340f78ea93Eda82d9',
//   '0x2a70F13998798Bd830293d15Ed390dA1F2C5fc44',
//   '0x616fc92cE6Ea765b3CBd7a03dfD7e707FbB81851',
//   '0xa0Ba72A2f8D3D619ffb70baAA7982c44708b145A',
//   '0x0948C098bE91e61050c531686d344e0B8d804Fd3',
//   '0xf29bDba5598a85e75D53edD2a880D30E477a5A9a',
//   '0xA2Fad94B16675a6Aa9e89308cc0192a2C5F0749b',
//   '0x99B4f686EF406C9c4FE5468655A2d30E266C5536',
//   '0xb08439deE0Bc1E7D5945B590B178F6833dF0bea1',
//   '0xBf7C82A1B67B4Ed6095A12140F5cfc1Ae56783AF',
//   '0xf060AbF8f9DFa4c266c4366feb6642a39c3B5a5e',
//   '0x2aB030407955b9921D12dFAA2B928D6Ac30734Af',
//   '0x20861b4Dc1A505d208321e6E8816824a0F4E4c94',
//   '0xd7DFD2AB0BE47EE46Ca281859408A94aC466736E'
// ]
//the owners of rangers (dapp)
const ownersRPG = {
  bridge: "0x9c1CbFE5328DFB1733d59a7652D0A49228c7E12C",
  // nodeManager: "0x74448149F549CD819b7173b6D67DbBEAFd2909a7"
}
const owners = [...Object.values(ownersRPG)]

async function tvl(api) {  
  return sumTokens2({ api, owners, tokens: Object.values(tokens) })
}
module.exports = {
  misrepresentedTokens: true,
  methodology: "Count the sum of the five tokens (RPG, USDT, MIX, AMG, COIN) of the dapp platform (bridge, nodeManager) on the rangers blockchain.",
  rpg: {
    tvl
  }
}