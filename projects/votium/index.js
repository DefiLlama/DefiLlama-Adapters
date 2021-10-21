const sdk = require("@defillama/sdk")
const web3 = require('../config/web3.js')
const BigNumber = require("bignumber.js")
const abi = require('./abi.json')

// Best reference: https://votium.app/static/js/components/Header/Header.js
// Good reference: https://github.com/oo-00/Votium/blob/main/utils/allDelegations.js
async function getTotalLocked_supply(timestamp, block, chainBlocks) {  
  // Contract constants
  const vlCVXAddress = "0xD18140b4B819b895A3dba5442F959fA44994AF50"
  const cvxCRVAddress = "0x62B9c7356A2Dc64a1969e19C23e4f579F9810Aa7"
  const liveProposalOngoing = true

  // vlCVX locked
  vlCVXContract = new web3.eth.Contract(abi['vlCVXABI'], vlCVXAddress)
  let vlCVXLocked
  if (liveProposalOngoing) {
    //locked at current epoch (uncomment on live proposal):
    let epochCount = await vlCVXContract.methods.epochCount().call()
    vlCVXLocked = await vlCVXContract.methods.totalSupplyAtEpoch(epochCount - 1).call()
  } 
  else {
    //total supply locked (uncomment between proposals):
    vlCVXLocked = await vlCVXContract.methods.lockedSupply().call()
  }
  //vlCVXLocked = new BigNumber(vlCVXLocked).div(10 ** 18)
  //vlCVXLocked = Number(vlCVXLocked).toFixed(2)
  vlCVXLocked = vlCVXLocked / 1e18
  console.log('vlCVXLocked', vlCVXLocked)

  // veCRV locked 
  cvxCRVContract = new web3.eth.Contract(abi['cvxCRVABI'], cvxCRVAddress)
  let veCRVLocked = await cvxCRVContract.methods.totalSupply().call()
  //veCRVLocked = new BigNumber(veCRVLocked).div(10 ** 18).toPrecision()
  //veCRVLocked = Number(veCRVLocked).toFixed(2)
  veCRVLocked = veCRVLocked / 1e18
  console.log('veCRVLocked', veCRVLocked)

  return {
    'vlCVXLocked': vlCVXLocked, 
    'veCRVLocked': veCRVLocked
  }
}

async function getTotalLocked_underlying(timestamp, block, chainBlocks) {
  // CVX and cvxCRV locked in contract https://etherscan.io/address/0xD18140b4B819b895A3dba5442F959fA44994AF50
  let cvxLocked = await sdk.api.erc20.balanceOf({
    target: '0x4e3fbd56cd56c3e72c1403e103b45db9da5b9d2b',
    owner: '0xD18140b4B819b895A3dba5442F959fA44994AF50',
    block: chainBlocks['ethereum'],
    chain: 'ethereum'
  })
  let cvxCRVLocked = await sdk.api.erc20.balanceOf({
    target: '0x62b9c7356a2dc64a1969e19c23e4f579f9810aa7',
    owner: '0xD18140b4B819b895A3dba5442F959fA44994AF50',
    block: chainBlocks['ethereum'],
    chain: 'ethereum'
  })
  return {
    '0x4e3fbd56cd56c3e72c1403e103b45db9da5b9d2b': cvxLocked.output, 
    '0x62b9c7356a2dc64a1969e19c23e4f579f9810aa7': cvxCRVLocked.output
  }
}

async function tvl(timestamp, block, chainBlocks) {
  balances = await getTotalLocked_underlying(timestamp, block, chainBlocks)
  return balances
}


module.exports = {
  tvl,   
  methodology: `Votium TVL is the sum of CVX and cvxCRV locked into the Votium contract`, 
}
