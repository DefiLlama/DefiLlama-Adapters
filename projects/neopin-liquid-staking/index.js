const npEthContract = '0x841d3B6660663Ed4B0D9b9EDAEe6642e05A4E182';
const npKlayContract = '0xb0BB95ac3195A266Ab924596Ba32c2a10e245a95';

async function getEthTvl(api) {
  api.addGasToken(await api.call({ target: npEthContract, abi: 'uint256:getTotalPooledEth' }))
}

async function getKlayTvl(api) {
  api.addGasToken(await api.call({ target: npKlayContract, abi: 'uint256:getTotalPooledKlay' }))
}

module.exports = {
  methodology: 'Staked  are counted as TVL based on the chain that they are staked on and where the liquidity tokens are issued, npETH and npKLAY are counted as Ethereum TVL and Klaytn TVL since ETH and KLAY are staked in each mainnet and the liquidity tokens are also issued on each mainnet network.',
  ethereum: { tvl: getEthTvl },
  klaytn: { tvl: getKlayTvl },
}
