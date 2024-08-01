const ADDRESSES = require('../helper/coreAssets.json')
const WSTETH_MAINNET = ADDRESSES.ethereum.WSTETH;
const RETH_MAINNET = ADDRESSES.ethereum.RETH;
const RSETH_MAINNET = ADDRESSES.ethereum.rsETH;
const WEETH_MAINNET = ADDRESSES.ethereum.weETH;
const ANKRETH_MAINNET = ADDRESSES.ethereum.ankrETH;
const OSETH_MAINNET = ADDRESSES.ethereum.osETH;
const EZETH_MAINNET = ADDRESSES.ethereum.ezETH;
const WSTETH_ARBITRUM = ADDRESSES.arbitrum.WSTETH;
const RETH_ARBITRUM = ADDRESSES.arbitrum.RETH;
const RSETH_ARBITRUM = ADDRESSES.arbitrum.rsETH;
const WEETH_ARBITRUM = ADDRESSES.arbitrum.weETH;
const EZETH_ARBITRUM = ADDRESSES.arbitrum.ezETH;
const BRACKET_ESCROW_PROXY = '0x9b9d7297C3374DaFA2A609d47C79904e467970Bc';

async function getEthereumTvl(api) {
  const wstETHCollateralBalance = await api.call({
    abi: 'erc20:balanceOf',
    target: WSTETH_MAINNET,
    params: [BRACKET_ESCROW_PROXY],
  });
  const rETHCollateralBalance = await api.call({
    abi: 'erc20:balanceOf',
    target: RETH_MAINNET,
    params: [BRACKET_ESCROW_PROXY],
  });
  const rsETHCollateralBalance = await api.call({
    abi: 'erc20:balanceOf',
    target: RSETH_MAINNET,
    params: [BRACKET_ESCROW_PROXY],
  });
  const weETHCollateralBalance = await api.call({
    abi: 'erc20:balanceOf',
    target: WEETH_MAINNET,
    params: [BRACKET_ESCROW_PROXY],
  });
  const ankrETHCollateralBalance = await api.call({
    abi: 'erc20:balanceOf',
    target: ANKRETH_MAINNET,
    params: [BRACKET_ESCROW_PROXY],
  });
  const osETHCollateralBalance = await api.call({
    abi: 'erc20:balanceOf',
    target: OSETH_MAINNET,
    params: [BRACKET_ESCROW_PROXY],
  });
  const ezETHCollateralBalance = await api.call({
    abi: 'erc20:balanceOf',
    target: EZETH_MAINNET,
    params: [BRACKET_ESCROW_PROXY],
  });

  api.add(WSTETH_MAINNET, wstETHCollateralBalance);
  api.add(RETH_MAINNET, rETHCollateralBalance);
  api.add(RSETH_MAINNET, rsETHCollateralBalance);
  api.add(WEETH_MAINNET, weETHCollateralBalance);
  api.add(ANKRETH_MAINNET, ankrETHCollateralBalance);
  api.add(OSETH_MAINNET, osETHCollateralBalance);
  api.add(EZETH_MAINNET, ezETHCollateralBalance);
}

async function getArbitrumTvl(api) {
  const wstETHCollateralBalance = await api.call({
    abi: 'erc20:balanceOf',
    target: WSTETH_ARBITRUM,
    params: [BRACKET_ESCROW_PROXY],
  });
  const rETHCollateralBalance = await api.call({
    abi: 'erc20:balanceOf',
    target: RETH_ARBITRUM,
    params: [BRACKET_ESCROW_PROXY],
  });
  const rsETHCollateralBalance = await api.call({
    abi: 'erc20:balanceOf',
    target: RSETH_ARBITRUM,
    params: [BRACKET_ESCROW_PROXY],
  });
  const weETHCollateralBalance = await api.call({
    abi: 'erc20:balanceOf',
    target: WEETH_ARBITRUM,
    params: [BRACKET_ESCROW_PROXY],
  });
  const ezETHCollateralBalance = await api.call({
    abi: 'erc20:balanceOf',
    target: EZETH_ARBITRUM,
    params: [BRACKET_ESCROW_PROXY],
  });

  api.add(WSTETH_ARBITRUM, wstETHCollateralBalance);
  api.add(RETH_ARBITRUM, rETHCollateralBalance);
  api.add(RSETH_ARBITRUM, rsETHCollateralBalance);
  api.add(WEETH_ARBITRUM, weETHCollateralBalance);
  api.add(EZETH_ARBITRUM, ezETHCollateralBalance);
}

module.exports = {
  methodology: 'Count the total collateral deposited into the liquidity escrow contract.',
  start: 1722430800,
  ethereum: {
    tvl: getEthereumTvl
  },
  arbitrum: {
    tvl: getArbitrumTvl
  }
}; 