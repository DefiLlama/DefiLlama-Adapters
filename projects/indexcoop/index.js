const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')
const sdk = require("@defillama/sdk")

const dpiAddress = "0x1494ca1f11d487c2bbe4543e90080aeba4ba3c2b";
const ethFliAddress = "0xaa6e8127831c9de45ae56bb1b0d4d4da6e5665bd";
const eth2x = "0x65c4C0517025Ec0843C9146aF266A2C5a2D148A2";
const mviAddress = "0x72e364f2abdc788b7e918bc238b21f109cd634d7";
const cgiAddress = "0xada0a1202462085999652dc5310a7a9e2bf3ed42";
const btcFliAddress = "0x0b498ff89709d3838a063f1dfa463091f9801c2b";
const btc2x = "0xD2AC55cA3Bbd2Dd1e9936eC640dCb4b745fDe759";
const bedAddress = "0x2aF1dF3AB0ab157e1E2Ad8F88A7D04fbea0c7dc6";
const dataAddress = "0x33d63Ba1E57E54779F7dDAeaA7109349344cf5F1";
const gmiAddress = "0x47110d43175f7f2c2425e7d15792acc5817eb44f";
const icethAddress = "0x7c07f7abe10ce8e33dc6c5ad68fe033085256a84";
const hyETH = "0xc4506022Fb8090774E8A628d5084EED61D9B99Ee";
const dsETH = "0x341c05c0E9b33C0E38d64de76516b2Ce970bB3BE";
const eth2xArb = "0x26d7D3728C6bb762a5043a1d0CeF660988Bca43C";
const eth3xArb = "0xA0A17b2a015c14BE846C5d309D076379cCDfa543";
const iEthArb = "0x749654601a286833aD30357246400D2933b1C89b";
const btc2xArb = "0xeb5bE62e6770137beaA0cC712741165C594F59D7";
const btc3xArb = "0x3bDd0d5c0C795b2Bf076F5C8F177c58e42beC0E6";
const iBtcArb = "0x80e58AEA88BCCaAE19bCa7f0e420C1387Cc087fC";
const eth2xBase = "0xC884646E6C88d9b172a23051b38B0732Cc3E35a6";
const eth3xBase = "0x329f6656792c7d34D0fBB9762FA9A8F852272acb";
const btc2xBase = "0x186f3d8bb80dff50750babc5a4bcc33134c39cde";
const btc3xBase = "0x1F4609133b6dAcc88f2fa85c2d26635554685699";
const aaveDebtToken = "0xf63b34710400cad3e044cffdcab00a0f32e33ecf";
const USDC = ADDRESSES.ethereum.USDC
const gtcETH = '0x36c833Eed0D376f75D1ff9dFDeE260191336065e'
const sets = [
  dpiAddress,
  eth2x,
  btc2x,
  mviAddress,
  cgiAddress,
  bedAddress,
  dataAddress,
  gmiAddress,
  icethAddress,
  dsETH,
  gtcETH,
  hyETH,
  eth2xArb,
  eth3xArb,
  iEthArb,
  btc2xArb,
  btc3xArb,
  iBtcArb,
  eth2xBase,
  eth3xBase,
  btc2xBase,
  btc3xBase,
];

async function tvl(api) {
  const tokens = await api.multiCall({ abi: 'address[]:getComponents', calls: sets })
  const toa = []
  sets.forEach((o, i) => toa.push([tokens[i], o]))
  toa.push([[aaveDebtToken], icethAddress])
  toa.push([['0x72e95b8931767c79ba4eee721354d6e99a61d004'], eth2x])
  toa.push([['0x72E95b8931767C79bA4EeE721354d6E99a61D004'], btc2x])
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
