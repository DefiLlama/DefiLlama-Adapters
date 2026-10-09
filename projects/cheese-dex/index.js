const ADDRESSES = require('../helper/coreAssets.json');

const VAULT_ADDRESS = '0xe26E75e145bfd03A696B9bd7205dFd1ac63d370F';
const USDT = '0x55d398326f99059ff775485246999027b3197955';
const USDC = '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d';

async function tvl(api) {
  const [usdtBalance, usdcBalance] = await api.multiCall({
    abi: 'erc20:balanceOf',
    calls: [
      { target: USDT, params: [VAULT_ADDRESS] },
      { target: USDC, params: [VAULT_ADDRESS] },
    ],
  });

  const nchBalance = await api.provider.getBalance(VAULT_ADDRESS);

  api.add(ADDRESSES.ethereum.USDT, usdtBalance, { skipChain: true });
  api.add(ADDRESSES.ethereum.USDC, usdcBalance, { skipChain: true });
  api.addGasToken(nchBalance);
}

module.exports = {
  methodology: 'Counts NCH, USDT, and USDC liquidity locked in the Cheese DEX Master Vault on Cheese Blockchain.',
  cheese: {
    tvl,
  },
};
