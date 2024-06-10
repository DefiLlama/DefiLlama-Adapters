async function metisTvl(api) {
  const vaultStorageAddress = "0xFaEee486F4A53cdBEaBE37216bcf1016eB4E52D6";

  // eth, usdt, usdc
  const zenoUnderlyingTokens = [
    "0x420000000000000000000000000000000000000a",
    "0xEA32A96608495e54156Ae48931A7c20f0dcc1a21",
    "0xbB06DCA3AE6887fAbF931640f67cab3e3a16F4dC",
  ];

  return api.sumTokens({
    owner: vaultStorageAddress,
    tokens: zenoUnderlyingTokens,
  });
}

module.exports = {
  start: 1710294153,
  metis: {
    tvl: metisTvl,
  },
};
