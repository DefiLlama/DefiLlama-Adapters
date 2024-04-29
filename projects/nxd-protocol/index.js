const NXD_PROTOCOL_ADDRESS = '0xE05430D42842C7B757E5633D19ca65350E01aE11';
const DXN_ERC20_ADDRESS = '0x80f0C1c49891dcFDD40b6e0F960F84E6042bcB6F';
const NXD_ERC20_ADDRESS = '0x70536D44820fE3ddd4A2e3eEdbC937b8B9D566C7';
const NXD_STAKING_VAULT_ADDRESS = '0xa1B56E42137D06280E34B3E1352d80Ac3BECAF79';
const NXD_DXN_UNIV2_POOL = '0x98134CDE70ff7280bb4b9f4eBa2154009f2C13aC';
const TAX_RECIPIENT = '0x61e0318C8d5A855D63D989b02D859Aae5020b308';
const ABI = {
  'totalDXNDepositedLMP':
    'function totalDXNDepositedLMP() view returns (uint256)',
  'totalDXNStaked': 'function totalDXNStaked() view returns (uint256)',
  'dxnStaked': 'function dxnStaked() view returns (uint256)',
};
const lpReservesAbi =
  'function getReserves() view returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast)';

async function tvl(_, _1, _2, { api }) {
  const nxdStaked = await api.call({
    abi: 'erc20:balanceOf',
    target: NXD_ERC20_ADDRESS,
    params: [NXD_STAKING_VAULT_ADDRESS],
  });
  const dxnStakedLMP = await api.call({
    abi: ABI.totalDXNDepositedLMP,
    target: NXD_PROTOCOL_ADDRESS,
    params: [],
  });
  const dxnStakedAfterLMP = await api.call({
    abi: ABI.totalDXNStaked,
    target: NXD_PROTOCOL_ADDRESS,
    params: [],
  });
  const dxnStakedFoT = await api.call({
    abi: ABI.dxnStaked,
    target: TAX_RECIPIENT,
    params: [],
  });

  // NXD is untracked on DefiLlama, so we need to get the reserves of the pool to get NXD price in DXN.
  const nxdDxnReserves = await api.call({
    abi: lpReservesAbi,
    target: NXD_DXN_UNIV2_POOL,
    params: [],
  });

  const nxdPriceInDXN = nxdDxnReserves._reserve1 / nxdDxnReserves._reserve0;

  const nxdStakedInDXN = nxdStaked * nxdPriceInDXN;

  api.addTokens(
    [
      DXN_ERC20_ADDRESS,
      DXN_ERC20_ADDRESS,
      DXN_ERC20_ADDRESS,
      DXN_ERC20_ADDRESS,
    ],
    [dxnStakedLMP, dxnStakedAfterLMP, dxnStakedFoT, nxdStakedInDXN]
  );
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology:
    'We count the TVL of NXD Protocol by checking the total amount of NXD staked in the Staking Vault in addition to the total DXN staked by the protocol.',
  ethereum: {
    tvl,
  },
};
