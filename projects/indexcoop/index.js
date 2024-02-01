const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')
const sdk = require("@defillama/sdk")

const dpiAddress = "0x1494ca1f11d487c2bbe4543e90080aeba4ba3c2b";
const ethFliAddress = "0xaa6e8127831c9de45ae56bb1b0d4d4da6e5665bd";
const mviAddress = "0x72e364f2abdc788b7e918bc238b21f109cd634d7";
const cgiAddress = "0xada0a1202462085999652dc5310a7a9e2bf3ed42";
const btcFliAddress = "0x0b498ff89709d3838a063f1dfa463091f9801c2b";
const bedAddress = "0x2aF1dF3AB0ab157e1E2Ad8F88A7D04fbea0c7dc6";
const dataAddress = "0x33d63Ba1E57E54779F7dDAeaA7109349344cf5F1";
const gmiAddress = "0x47110d43175f7f2c2425e7d15792acc5817eb44f";
const icethAddress = "0x7c07f7abe10ce8e33dc6c5ad68fe033085256a84";
const dsETH = "0x341c05c0E9b33C0E38d64de76516b2Ce970bB3BE";
const aaveDebtToken = "0xf63b34710400cad3e044cffdcab00a0f32e33ecf";
const USDC = ADDRESSES.ethereum.USDC
const gtcETH = '0x36c833Eed0D376f75D1ff9dFDeE260191336065e'
const sets = [
  dpiAddress,
  ethFliAddress,
  mviAddress,
  cgiAddress,
  btcFliAddress,
  bedAddress,
  dataAddress,
  gmiAddress,
  icethAddress,
  dsETH,
  gtcETH,
];

async function tvl(timestamp, block, _, { api }) {
  const tokens = await api.multiCall({ abi: 'address[]:getComponents', calls: sets })
  const toa = []
  sets.forEach((o, i) => toa.push([tokens[i], o]))
  toa.push([[aaveDebtToken], icethAddress])
  const balances = await sumTokens2({ api, ownerTokens: toa, blacklistedTokens: sets })
  const usdcDebt = await api. multiCall({abi:"function borrowBalanceStored(address account) view returns (uint256)", target: "0x39aa39c021dfbae8fac545936693ac917d5e7563", calls:[ethFliAddress, btcFliAddress]})
  usdcDebt.forEach(i => sdk.util.sumSingleBalance(balances,USDC,i * -1, api.chain))
  return balances
}


module.exports = {
  ethereum: {
    tvl,
  },
};
