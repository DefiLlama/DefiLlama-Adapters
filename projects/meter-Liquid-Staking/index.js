const stMTRG = '0x215d603293357ca222bE92A1bf75eEc38DeF0aad';
async function tvl(api) {
  const stMTRGStaking = await api.call({
    target: stMTRG,
    abi: 'erc20:totalSupply',
  });
  return {
    meter: stMTRGStaking / 1e18
  };
}

module.exports = {
  meter: {
    tvl,
  }
}