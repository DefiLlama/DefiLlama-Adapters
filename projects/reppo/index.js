const REPPO_ADDRESS = '0xFf8104251E7761163faC3211eF5583FB3F8583d6';
const VEREPPO_ADDRESS = '0x0EFBE19Cb7B07D934D01990a8989E9CaA98b9009';

async function tvl(api) {
  const balance = await api.call({
    abi: 'erc20:balanceOf',
    target: REPPO_ADDRESS,
    params: [VEREPPO_ADDRESS],
  });
  api.add(REPPO_ADDRESS, balance);
}

module.exports = {
  methodology: 'TVL is the total REPPO tokens locked in the VeREPPO contract.',
  base: { tvl },
};
