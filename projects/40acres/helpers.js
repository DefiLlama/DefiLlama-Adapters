const { erc4626Abi, fortyAcresAbi } = require('./abi');

const vaultMapping = {
  optimism: '0x08dCDBf7baDe91Ccd42CB2a4EA8e5D199d285957',
  base: '0xB99B6dF96d4d5448cC0a5B3e0ef7896df9507Cf5'
}

const fortyAcresMapping = {
    optimism: '0xf132bD888897254521D13e2c401e109caABa06A7',
    base: '0x87f18b377e625b62c708D5f6EA96EC193558EFD0'
}

const baseTokenMapping = {
    optimism: '0x3c8B650257cFb5f272f799F5e2b4e65093a11a05', // VELO
    base: '0x940181a94A35A4569E4529A3CDfB74e38FD98631', // AERO
}

const veNftMapping = {
    optimism: '0xFAf8FD17D9840595845582fCB047DF13f006787d', // veVELO
    base: '0xeBf418Fe2512e7E6bd9b87a8F0f294aCDC67e6B4', // veAERO
}

// get the underlying asset of each erc4626 vault
const get4626VaultToken = async (api, addresses) => {
  return api.multiCall({ calls: addresses, abi: erc4626Abi.asset, });
}

async function getVaultBalance(api) {
    const vaultToken = await api.call({ target: vaultMapping[api.chain], abi: erc4626Abi.asset, });
    const vaultBalance = await api.call({ abi: 'erc20:balanceOf', target: vaultToken, params: [vaultMapping[api.chain]] })
    api.addTokens([vaultToken], [vaultBalance])
    return
}


async function getBorrowed(api) {
  const borrowed =  await api.call({
    abi: fortyAcresAbi.activeAssets,
    target: fortyAcresMapping[api.chain],
  });

  const vaultToken = await api.call({ target: vaultMapping[api.chain], abi: erc4626Abi.asset, });
  api.addTokens([vaultToken],  [borrowed])
  return
}

module.exports = {
    get4626VaultToken,
    getVaultBalance,
    fortyAcresMapping,
    baseTokenMapping,
    vaultMapping,
    veNftMapping,
    getBorrowed
}
