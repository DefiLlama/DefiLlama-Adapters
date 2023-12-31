async function tvl(_, _1, _2, { api }) {
  const Balance = await api.call({
    abi: 'erc20:balanceOf',
    target: '0x24599b658b57f91E7643f4F154B16bcd2884f9ac',
    params: ['0x280608DD7712a5675041b95d0000B9089903B569'],
  });

  api.add('0x24599b658b57f91E7643f4F154B16bcd2884f9ac', Balance)
}

module.exports = {
  jbc: {
    tvl,
  }
}; 
