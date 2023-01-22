const sdk = require("@defillama/sdk");
const abi = require('./abis/abi.json')
const { default: BigNumber } = require("bignumber.js");

const AladdinConvexVaultABI = require('./abis/AladdinConvexVault.json')
const AladdinCRVABI = require('./abis/AladdinCRV.json')
const AladdinAFXSABI = require('./abis/AladdinAFXS.json')
const { farmConfig, } = require('./config.js');

const concentratorVault = '0xc8fF37F7d057dF1BB9Ad681b53Fa4726f268E0e8';
const concentratorAcrv = '0x2b95A1Dcc3D405535f9ed33c219ab38E8d7e0884';
const concentratorAFXS = '0xDAF03D70Fe637b91bA6E521A32E1Fb39256d3EC9';
const concentratorAFrxETH = "0xb15Ad6113264094Fd9BF2238729410A07EBE5ABa";
const cvxcrvAddress = '0x62b9c7356a2dc64a1969e19c23e4f579f9810aa7';

const concentratorNewVault = '0x3Cf54F3A1969be9916DAD548f3C084331C4450b5';
const concentratorAfxsVault = '0xD6E3BB7b1D6Fa75A71d48CFB10096d59ABbf99E1';
const concentratorAfrxETHVault = '0x50B47c4A642231dbe0B411a0B2FBC1EBD129346D';
const usdtAddress = "0xdac17f958d2ee523a2206206994597c13d831ec7";
const aladdinBalancerLPGauge = '0x33e411ebE366D72d058F3eF22F1D0Cf8077fDaB0';
const chain = 'ethereum';
async function getBalancerLpTvl(balances, block) {
  const ctrLpTotalSupply = (await sdk.api.abi.call({
    target: aladdinBalancerLPGauge,
    block,
    abi: 'erc20:totalSupply',
    params: []
  })).output;
  sdk.util.sumSingleBalance(balances, usdtAddress, (BigNumber(ctrLpTotalSupply).shiftedBy(-12)).toFixed(0))
}

async function getFarmLpTvl(balances, block) {
  const farmData = farmConfig[0]
  const ctrLpTotalSupply = (await sdk.api.abi.call({
    target: farmData.addresses.gauge,
    block,
    abi: 'erc20:totalSupply',
    params: []
  })).output;
  sdk.util.sumSingleBalance(balances, chain + ':' + farmData.addresses.lpToken, ctrLpTotalSupply)
}

async function tvl(timestamp, block) {
  let balances = {}
  await getBalancerLpTvl(balances, block)
  await getFarmLpTvl(balances, block)
  await getAFXSInfo(balances, block);
  await getAfrxETHInfo(balances, block)
  const acrvTotalUnderlying = (await sdk.api.abi.call({
    target: concentratorAcrv,
    block,
    abi: AladdinCRVABI.totalUnderlying,
  })).output;
  sdk.util.sumSingleBalance(balances, chain + ':' + cvxcrvAddress, acrvTotalUnderlying)

  await getVaultInfo('old', balances, block)
  await getVaultInfo('New', balances, block)
  await getVaultInfo('afxs', balances, block)
  await getVaultInfo('afrxETH', balances, block)
  sdk.util.sumSingleBalance(balances, chain + ':' + cvxcrvAddress, acrvTotalUnderlying)
  return balances
}

async function getVaultInfo(type, balances, block) {
  let _target = concentratorVault;
  let _abi = AladdinConvexVaultABI.poolInfo;
  switch (type) {
    case 'old':
      _target = concentratorVault;
      break;
    case 'New':
      _target = concentratorNewVault;
      break;
    case 'afxs':
      _target = concentratorAfxsVault;
      break;
    case 'afrxETH':
      _target = concentratorAfrxETHVault;
      _abi = AladdinConvexVaultABI.afraxETHPoolInfo;
      break;
  }
  let poolInfo = await sdk.api2.abi.fetchList({ chain, block, lengthAbi: abi.poolLength, itemAbi: _abi, target: _target })
  poolInfo.forEach((item) => {
    if (type == 'afrxETH') {
      sdk.util.sumSingleBalance(balances, item.strategy.token, item.supply.totalUnderlying, chain)
    } else {
      sdk.util.sumSingleBalance(balances, item.lpToken, item.totalUnderlying, chain)
    }
  })
}

async function getAFXSInfo(balances, block) {
  const cvxfxsCrvInfo = {
    lpToken: '0xF3A43307DcAFa93275993862Aae628fCB50dC768'
  }
  const aFXSTotalUnderlying = (await sdk.api.abi.call({
    target: concentratorAFXS,
    block,
    abi: AladdinAFXSABI.totalAssets,
  })).output;

  sdk.util.sumSingleBalance(balances, chain + ':' + cvxfxsCrvInfo.lpToken, aFXSTotalUnderlying)
}

async function getAfrxETHInfo(balances, block) {
  const ethFrxETHCrvInfo = {
    lpToken: '0xf43211935C781D5ca1a41d2041F397B8A7366C7A'
  }
  const aFrxETHTotalUnderlying = (await sdk.api.abi.call({
    target: concentratorAFrxETH,
    block,
    abi: AladdinAFXSABI.totalAssets,
  })).output;
  sdk.util.sumSingleBalance(balances, chain + ':' + ethFrxETHCrvInfo.lpToken, aFrxETHTotalUnderlying)
}
module.exports = {
  doublecounted: true,
  ethereum: {
    tvl
  }
}
