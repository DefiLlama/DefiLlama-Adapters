const { stakingPricedLP } = require("../helper/staking");
const configs = {
  ETH_LOCKER: "0x957d6ff09368fcb01ca886f8e937368c6a4c760e",
  wstETH_LOCKER: "0x90075915714235a3816cf6ee4fe703c2e36a566a",
  weETH_LOCKER: "0x76e38de3d19b90afffc4253d1556b83c063e2ae8",
  ezETH_LOCKER: "0x05cca71e1f44e721fc16bbbcda6c62091d240deb",
  MULTICALL: "0xca11bde05977b3631167028862be2a173976ca11",
  ETH: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
  wstETH: "0x5979d7b546e38e414f7e9822514be443a4800529",
  weETH: "0x35751007a407ca6feffe80b3cb397736d2cf4dbe",
  ezETH: "0x2416092f143378750bb29b79ed961ab195cceea5",
};

async function tvl(_, _1, _2, { api }) {
  const ezETHVolume = await api.call({
    abi: "erc20:balanceOf",
    target: configs.ezETH,
    params: [configs.ezETH_LOCKER],
  });

  const wETHVolume = await api.call({
    abi: "erc20:balanceOf",
    target: configs.ETH,
    params: [configs.ETH_LOCKER],
  });

  const wstETHVolume = await api.call({
    abi: "erc20:balanceOf",
    target: configs.wstETH,
    params: [configs.wstETH_LOCKER],
  });
  api.add(configs.ETH, wETHVolume);
  api.add(configs.ezETH, ezETHVolume);
  api.add(configs.wstETH, wstETHVolume);
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: "Total staking",
  start: 210487219,
  arbitrum: {
    tvl,
  },
};
