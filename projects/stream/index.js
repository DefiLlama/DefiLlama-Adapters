const abi = require('./abi.js');
const { calculateTvl, getChainVaultData, getVaultRoundData } = require('./utils');

async function tvlEth(_, _1, _2, { api }) {
  const vaultData = getChainVaultData('ethereum');
  const vaultAddresses = vaultData.map(v => v.vaultAddress);

  const [rawBals, [rounds, pricePerShares]] = await Promise.all([
    api.multiCall({ abi: abi.totalSupply, calls: vaultAddresses }),
    getVaultRoundData(api, vaultAddresses)
  ]);

  vaultData.forEach((vault, i) => {
    if (!rawBals[i] || !pricePerShares[i]) return;
    const tvl = calculateTvl(
      BigInt(rawBals[i]),
      BigInt(pricePerShares[i]),
      vault.decimals
    );
    api.addToken(vault.assetAddress, tvl);
  });
}

async function tvlChain(chain, block, _1, _2, { api }) {
  const vaultData = getChainVaultData(chain);
  if (!vaultData.length) return;

  try {
    const mainnetApi = new api.constructor({ chain: 'ethereum', block: null });

    const [totalSupplies, [rounds, pricePerShares]] = await Promise.all([
      api.multiCall({
        abi: 'erc20:totalSupply',
        calls: vaultData.map(v => v.oftAddress),
        chain,
        permitFailure: true
      }),
      getVaultRoundData(mainnetApi, vaultData.map(v => v.vaultAddress))
    ]);

    vaultData.forEach((vault, i) => {
      if (!totalSupplies[i] || !pricePerShares[i]) return;

      const tvl = calculateTvl(
        BigInt(totalSupplies[i]),
        BigInt(pricePerShares[i]),
        vault.decimals
      );

      api.addToken(vault.assetAddress, tvl);
    });
  } catch (e) {
    console.error(`Error fetching TVL for ${chain}:`, e);
    throw e;
  }
}

async function tvlSonic(_, _1, _2, { api }) {
  return tvlChain('sonic', _, _1, _2, { api });
}

async function tvlBerachain(_, _1, _2, { api }) {
  return tvlChain('berachain', _, _1, _2, { api });
}

async function tvlBase(_, _1, _2, { api }) {
  return tvlChain('base', _, _1, _2, { api });
}

module.exports = {
  misrepresentedTokens: true,
  methodology: "Calculates the TVL of all Stream vaults across multiple chains",
  start: 1739697390,
  ethereum: {
    tvl: tvlEth,
  },
  sonic: {
    tvl: tvlSonic,
  },
  berachain: {
    tvl: tvlBerachain,
  },
  base: {
    tvl: tvlBase,
  }
};
