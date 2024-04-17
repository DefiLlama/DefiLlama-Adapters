const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const { sumTokensAndLPsSharedOwners } = require('../helper/unwrapLPs')

const weth = ADDRESSES.ethereum.WETH

async function tvl(timestamp, block) {
  const balances = {}
  const owners = [
    '0xBFfB152b9392e38CdDc275D818a3Db7FE364596b', // GenesisGroup.sol [OLD]
    '0xa08A721dFB595753FFf335636674D76C455B275C', // EthReserveStabilizer.sol [OLD]
    '0x17305f0e18318994a57b494078CAC866A857F7b6', // EthReserveStabilizer.sol
    '0xe1578B4a32Eaefcd563a9E6d0dc02a4213f673B7', // EthBondingCurve.sol [OLD]
    '0xB783c0E21763bEf9F2d04E6499abFbe23AdB7e1F', // EthBondingCurve.sol
    '0xDa079A280FC3e33Eb11A78708B369D5Ca2da54fE', // EthPCVDripper.sol [OLD]

    // Holders of FEI-ETH Uni V2 LP 
    '0x15958381E9E6dc98bD49655e36f524D2203a28bD', // EthUniswapPCVDeposit.sol
    '0x5d6446880fcd004c851ea8920a628c70ca101117', // EthUniswapPCVDepost.sol [OLD]
    '0x9b0C6299D08fe823f2C0598d97A1141507e4ad86', // EthUniswapPCVDeposit.sol [OLD]

    // Holders of stETH
    '0xAc38Ee05C0204A1E119C625d0a560D6731478880', // EthLidoPCVDeposit.sol

    // Holders of aWETH
    '0x5B86887e171bAE0C2C826e87E34Df8D558C079B9', // AavePCVDeposit.sol

    // Holders of cETH
    '0x4fCB1435fD42CE7ce7Af3cB2e98289F79d2962b3', // EthCompoundPCVDeposit.sol  

    // Holders of cDAI
    '0xe0f73b8d76D2Ad33492F995af218b03564b8Ce20', // DaiCompoundPCVDeposit.sol

    // Holders of INDEX
    '0x0ee81df08B20e4f9E0F534e50da437D24491c4ee', // IndexSnapshotDelegator.sol

    // Holders of aRAI
    '0xd2174d78637a40448112aa6B30F9B19e6CF9d1F9', // AaveRaiPCVDeposit.sol

    // Holders of RAI in fuse pool 9
    '0x9aAdFfe00eAe6d8e59bB4F7787C6b99388A6960D', // RaiFusePcvDeposit.sol

    // Holders of FEI-DPI Sushi LP
    '0x902199755219A9f8209862d09F1891cfb34F59a3', // DpiSushiPcvDeposit.sol

    // Holders of DPI in Fuse pool 19
    '0x3dD3d945C4253bAc5B4Cc326a001B7d3f9C4DD66', // DpiFusePcvDeposit.sol
  ]
  await sumTokensAndLPsSharedOwners(balances, [
    ['0x94b0a3d511b6ecdb17ebf877278ab030acb0a878', true], // FEI-ETH Uni V2 LP (NOTE: this counts both FEI and ETH, but only the FEI doesn't count as PCV)
    [ADDRESSES.ethereum.STETH, false], // stETH
    ['0x030ba81f1c18d280636f32af80b9aad02cf0854e', false], // aWETH
    ['0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5', false], // cETH
    ['0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643', false], // cDAI
    ['0x0954906da0Bf32d5479e25f46056d22f08464cab', false], // INDEX
    ['0xc9BC48c72154ef3e5425641a3c747242112a46AF', false], // aRAI
    ['0x752F119bD4Ee2342CE35E2351648d21962c7CAfE', false], // RAI in Fuse pool 9
    ['0x8775aE5e83BC5D926b6277579c2B0d40c7D9b528', true], // FEI-DPI Sushi LP (NOTE: this counts both the FEI and the DPI, but only the FEI doesn't count as PCV)
    ['0xF06f65a6b7D2c401FcB8B3273d036D21Fe2a5963', false], // DPI in Fuse pool 19
  ], owners, block)
  const directETH = await sdk.api.eth.getBalances({
    targets: owners,
    block
  })
  directETH.output.forEach(eth => {
    sdk.util.sumSingleBalance(balances, weth, eth.balance)
  })
  return balances
}

module.exports = {
    ethereum: { tvl },
};
module.exports.hallmarks = [
  [1651325520, "Exploit $80M FEI"],
]