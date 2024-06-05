const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const abi = require('./abis/abi.json')
const { default: BigNumber } = require("bignumber.js");

const AladdinConvexVaultABI = require('./abis/AladdinConvexVault.json')
const AladdinCRVABI = require('./abis/AladdinCRV.json')
const AladdinAFXSABI = require('./abis/AladdinAFXS.json')
const AladdinCVXABI = require('./abis/AladdinCVX.json')
const AladdinSdCRVABI = require('./abis/AladdinSdCRV.json')
const { farmConfig } = require('./config.js');


const concentratorVault = '0xc8fF37F7d057dF1BB9Ad681b53Fa4726f268E0e8';
const concentratorAcrv = '0x2b95A1Dcc3D405535f9ed33c219ab38E8d7e0884';
const concentratorAFXS = '0xDAF03D70Fe637b91bA6E521A32E1Fb39256d3EC9';
const concentratorAFrxETH = "0xb15Ad6113264094Fd9BF2238729410A07EBE5ABa";
const cvxcrvAddress = ADDRESSES.ethereum.cvxCRV;
const concentratorAbcCVXAddress = '0xDEC800C2b17c9673570FDF54450dc1bd79c8E359';
const concentratorAsdCRVAddress = "0x43E54C2E7b3e294De3A155785F52AB49d87B9922"
const aladdinCVXAddress = "0xb0903Ab70a7467eE5756074b31ac88aEBb8fB777";

const concentratorNewVault = '0x3Cf54F3A1969be9916DAD548f3C084331C4450b5';
const concentratorAfxsVault = '0xD6E3BB7b1D6Fa75A71d48CFB10096d59ABbf99E1';
const concentratorAfrxETHVault = '0x50B47c4A642231dbe0B411a0B2FBC1EBD129346D';
const concentratorAsdCRVVault = "0x59866EC5650e9BA00c51f6D681762b48b0AdA3de";
const usdtAddress = ADDRESSES.ethereum.USDT;
const aladdinBalancerLPGauge = '0x33e411ebE366D72d058F3eF22F1D0Cf8077fDaB0';
const clevCVXAddress = "0xf05e58fCeA29ab4dA01A495140B349F8410Ba904"
const clevCVXCVXAddress = "0xF9078Fb962A7D13F55d40d49C8AA6472aBD1A5a6"
const sdCRVAddress = '0xD1b5651E55D4CeeD36251c61c50C889B36F6abB5'
const cvxAddress = ADDRESSES.ethereum.CVX;

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
  sdk.util.sumSingleBalance(balances, farmData.addresses.lpToken, ctrLpTotalSupply, chain)
}

async function tvl(api) {
  const block = api.block
  let balances = {}
  await Promise.all([
    getBalancerLpTvl(balances, block),
    getFarmLpTvl(balances, block),
    getAFXSInfo(balances, block),
    getAfrxETHInfo(balances, block),
    getAbcCVXInfo(balances, block),
    getAsdCRVInfo(balances, block),
    getAladdinCVXInfo(balances, block),
    getVaultInfo('old', balances, block),
    getVaultInfo('New', balances, block),
    getVaultInfo('afxs', balances, block),
    getVaultInfo('afrxETH', balances, block),
    getVaultInfo("asdCRV", balances, block),
    addACRVbalance(balances, api),
  ])
  return balances
}

async function addACRVbalance(balances, api) {
  const acrvTotalUnderlying = await api.call({
    target: concentratorAcrv,
    abi: AladdinCRVABI.totalUnderlying,
  })
  sdk.util.sumSingleBalance(balances, cvxcrvAddress, acrvTotalUnderlying, api.chain)

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
    case "asdCRV":
      _target = concentratorAsdCRVVault;
      _abi = AladdinConvexVaultABI.asdCRVPoolInfo;
      break;
  }
  let poolInfo = await sdk.api2.abi.fetchList({ chain, block, lengthAbi: abi.poolLength, itemAbi: _abi, target: _target })
  poolInfo.forEach((item) => {
    if (type == 'afrxETH' || type == 'asdCRV') {
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

  sdk.util.sumSingleBalance(balances, cvxfxsCrvInfo.lpToken, aFXSTotalUnderlying, chain)
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
  sdk.util.sumSingleBalance(balances, ethFrxETHCrvInfo.lpToken, aFrxETHTotalUnderlying, chain)
}

async function getAbcCVXInfo(balances, block) {
  const totalClevCVXAmount = (await sdk.api.abi.call({
    target: concentratorAbcCVXAddress,
    block,
    abi: AladdinCVXABI.totalDebtToken,
  })).output;
  const totalCurveLpTokenAmount = (await sdk.api.abi.call({
    target: concentratorAbcCVXAddress,
    block,
    abi: AladdinCVXABI.totalCurveLpToken,
  })).output;
  sdk.util.sumSingleBalance(balances, clevCVXAddress, totalClevCVXAmount, chain)
  sdk.util.sumSingleBalance(balances, clevCVXCVXAddress, totalCurveLpTokenAmount, chain)
}

async function getAsdCRVInfo(balances, block) {
  const asdCRVTotalUnderlying = (await sdk.api.abi.call({
    target: concentratorAsdCRVAddress,
    block,
    abi: AladdinSdCRVABI.totalAssets,
  })).output;
  sdk.util.sumSingleBalance(balances, sdCRVAddress, asdCRVTotalUnderlying, chain)
}

async function getAladdinCVXInfo(balances, block) {
  const aladdinCVXTotalUnderlying = (
    await sdk.api.abi.call({
      target: aladdinCVXAddress,
      block,
      abi: AladdinAFXSABI.totalAssets,
    })
  ).output;
  sdk.util.sumSingleBalance(
    balances,
    cvxAddress,
    aladdinCVXTotalUnderlying,
    chain
  );
}

module.exports = {
  doublecounted: true,
  ethereum: {
    tvl
  }
}