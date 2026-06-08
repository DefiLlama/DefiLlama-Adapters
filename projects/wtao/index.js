// wTAO: native TAO bridged from Bittensor and minted 1:1 as an ERC-20 on
// Ethereum. The wrapped supply is fully backed by TAO custodied on Bittensor,
// so the TAO locked in the bridge equals the token's total supply. Read it
// straight from the contract and value it as native TAO (9 decimals).
const WTAO = '0x77e06c9eccf2e797fd462a92b6d7642ef85b0a44';

async function tvl(api) {
  const supply = await api.call({ target: WTAO, abi: 'erc20:totalSupply' });
  api.addCGToken('bittensor', supply / 1e9);
}

module.exports = {
  timetravel: false,
  methodology:
    'TAO locked in the bridge, measured as the total supply of the wTAO ERC-20 on Ethereum (0x77e06c9eccf2e797fd462a92b6d7642ef85b0a44), which is minted 1:1 against native TAO custodied on Bittensor and priced as TAO.',
  ethereum: {
    tvl,
  },
};
