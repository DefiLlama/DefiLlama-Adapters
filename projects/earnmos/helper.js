const { ethers } = require('ethers');

const VaultAbi = require('./abi/Vault.json');
const UniswapV2PairAbi = require('./abi/UniswapV2Pair.json');
const UniswapV2RouterAbi = require('./abi/UniswapV2Router.json');

const USDCAddress = '0x51e44FfaD5C2B122C8b635671FCC8139dc636E82';
const WEVMOSAddress = '0xD4949664cD82660AaE99bEdc034a0deA8A0bd517';
const DIFFAddress = '0x3f75ceabcdfed1aca03257dc6bdc0408e2b4b026';
const WETHAddress = '0x5842C5532b61aCF3227679a8b1BD0242a41752f2';

const string1e18 = Math.pow(10, 18)?.toString();

const UsdcWevmosLpAddress = '0x6DF94e977D82d917a621DFf75C00aBd19A27c26B';
const DiffWevmosLpAddress = '0x932c2D21fa11A545554301E5E6FB48C3accdFF4D';
const WethWevmosLpAddress = '0x3c038E92c44515a8A75Ad4fFdFc6d7286232Ed56';
const UniswapV2RouterAddress = '0xFCd2Ce20ef8ed3D43Ab4f8C2dA13bbF1C6d9512F';

const UsdcWevmosVaultAddress = '0x0f91bF3e5a3e4450Ad4f8Af09d03A35069A726D9';
const DiffWevmosVaultAddress = '0xB10eb79B6A381F58f234CB90936E76Ae4a97A476';
const WethWevmosVaultAddress = '0x7a2ff76ed75E7e105ECbBE9B11f3dF0Fa89bd369';

function getProvider() {
  return new ethers.providers.JsonRpcProvider(
    "https://eth.bd.evmos.org:8545"
  );
}

async function getLpPrice() {
  const provider = getProvider();

  const usdcWevmosLpTokenContract = new ethers.Contract(UsdcWevmosLpAddress, UniswapV2PairAbi, provider);
  const diffWevmosLpTokenContract = new ethers.Contract(DiffWevmosLpAddress, UniswapV2PairAbi, provider);
  const wethWevmosLpTokenContract = new ethers.Contract(WethWevmosLpAddress, UniswapV2PairAbi, provider);
  const uniswapV2RouterContract = new ethers.Contract(UniswapV2RouterAddress, UniswapV2RouterAbi, provider);

  const [
    [usdcReserves0, wevmosReserves0],
    totalSupply0,
    [diffReserves, wevmosReserves1],
    totalSupply1,
    [wethReserves, wevmosReserves2],
    totalSupply2
  ] = await Promise.all([
    usdcWevmosLpTokenContract.getReserves(),
    usdcWevmosLpTokenContract.totalSupply(),
    diffWevmosLpTokenContract.getReserves(),
    diffWevmosLpTokenContract.totalSupply(),
    wethWevmosLpTokenContract.getReserves(),
    wethWevmosLpTokenContract.totalSupply(),
  ]);

  const [
    [, changeWevmos],
    [, changeDiff],
    [, changeWeth]
  ] = await Promise.all([
    uniswapV2RouterContract.getAmountsOut(
      Math.pow(10, 18).toString(),
      [WEVMOSAddress, USDCAddress]
    ),
    uniswapV2RouterContract.getAmountsOut(
      Math.pow(10, 18).toString(),
      [WEVMOSAddress, DIFFAddress]
    ),
    uniswapV2RouterContract.getAmountsOut(
      Math.pow(10, 18).toString(),
      [WEVMOSAddress, WETHAddress]
    )
  ]);

  const wevmosPrice = changeWevmos?.mul(Math.pow(10, 12)?.toString());

  const wevmosValue0 = wevmosReserves0?.mul(wevmosPrice);
  const totalValue0 = usdcReserves0
    ?.mul(Math.pow(10, 12)?.toString())
    ?.mul(string1e18)
    ?.add(wevmosValue0);
  const usdcWevmosDlpPrice = totalValue0?.div(totalSupply0);

  const diffPrice = wevmosPrice?.mul(string1e18)?.div(changeDiff);
  const diffValue = diffReserves?.mul(diffPrice);
  const wevmosValue1 = wevmosReserves1?.mul(wevmosPrice);
  const totalValue1 = diffValue?.add(wevmosValue1);
  const diffWevmosDlpPrice = totalValue1?.div(totalSupply1);

  const wethPrice = wevmosPrice?.mul(string1e18)?.div(changeWeth);
  const wethValue = wethReserves?.mul(wethPrice);
  const wevmosValue2 = wevmosReserves2?.mul(wevmosPrice);
  const totalValue2 = wethValue?.add(wevmosValue2);
  const wethWevmosDlpPrice = totalValue2?.div(totalSupply2);

  return {
    [UsdcWevmosVaultAddress]: usdcWevmosDlpPrice,
    [DiffWevmosVaultAddress]: diffWevmosDlpPrice,
    [WethWevmosVaultAddress]: wethWevmosDlpPrice
  };
}

async function getAmountLVtoLP(address) {
  const provider = getProvider();

  const contract = new ethers.Contract(address, VaultAbi, provider);

  return await contract.getPricePerFullShare();
}

module.exports = {
  getLpPrice,
  getAmountLVtoLP,
  UsdcWevmosVaultAddress,
  DiffWevmosVaultAddress,
  WethWevmosVaultAddress
}
