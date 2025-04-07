const abi = require("./abi.js");

const ethVaults = {
  STREAMUSD_WRAPPER_CONTRACT: "0x6eAf19b2FC24552925dB245F9Ff613157a7dbb4C",
  STREAMBTC_WRAPPER_CONTRACT: "0x05F47d7CbB0F3d7f988E442E8C1401685D2CAbE0",
  STREAMETH_WRAPPER_CONTRACT: "0xF70f54cEFdCd3C8f011865685FF49FB80A386a34",
};

const streamVaults = {
  STREAMUSD_VAULT_CONTRACT: "0xE2Fc85BfB48C4cF147921fBE110cf92Ef9f26F94",
  STREAMBTC_VAULT_CONTRACT: "0x12fd502e2052CaFB41eccC5B596023d9978057d6",
  STREAMETH_VAULT_CONTRACT: "0x7E586fBaF3084C0be7aB5C82C04FfD7592723153"
}

const chainContracts = {
  base: {
    STREAMUSD_OFT_BASE: "0xa791082be08B890792c558F1292Ac4a2Dad21920",
    STREAMBTC_OFT_BASE: "0x09Aed31D66903C8295129aebCBc45a32E9244a1f",
    STREAMETH_OFT_BASE: "0x6202B9f02E30E5e1c62Cc01E4305450E5d83b926"
  },
  sonic: {
    STREAMUSD_OFT_BASE: "0x6202B9f02E30E5e1c62Cc01E4305450E5d83b926",
    STREAMBTC_OFT_BASE: "0xB88fF15ae5f82c791e637b27337909BcF8065270",
    STREAMETH_OFT_BASE: "0x16af6b1315471Dc306D47e9CcEfEd6e5996285B6"
  },
  berachain: {
    STREAMUSD_OFT_BASE: "0x6eAf19b2FC24552925dB245F9Ff613157a7dbb4C",
    STREAMBTC_OFT_BASE: "0xa791082be08B890792c558F1292Ac4a2Dad21920",
    STREAMETH_OFT_BASE: "0x94f9bB5c972285728DCee7EAece48BeC2fF341ce"
  }
};

const chainTokens = {
  sonic: {
    USDC: '0x29219dd400f2Bf60E5a23d13Be72B486D4038894',
    WBTC: '0x0555E30da8f98308EdB960aa94C0Db47230d2B9c',
    WETH: '0x50c42dEAcD8Fc9773493ED674b675bE577f2634b'
  },
  berachain: {
    USDC: '0x549943e04f40284185054145c6E4e9568C1D3241',
    WBTC: '0x0555E30da8f98308EdB960aa94C0Db47230d2B9c',
    WETH: '0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590'
  },
  base: {
    USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    WBTC: '0x0555E30da8f98308EdB960aa94C0Db47230d2B9c',
    WETH: '0x4200000000000000000000000000000000000006'
  }
};

const vaultMapping = {
  STREAMUSD_OFT_BASE: {
    vault: 'STREAMUSD_VAULT_CONTRACT',
    asset: 'USDC'
  },
  STREAMBTC_OFT_BASE: {
    vault: 'STREAMBTC_VAULT_CONTRACT',
    asset: 'WBTC'
  },
  STREAMETH_OFT_BASE: {
    vault: 'STREAMETH_VAULT_CONTRACT',
    asset: 'WETH'
  }
};

async function tvlEth(_, _1, _2, { api }) {
  const vaults = Object.values(ethVaults);
  const bals = await api.multiCall({ abi: abi.totalSupply, calls: vaults });
  const tokens = await api.multiCall({ abi: abi.asset, calls: vaults });
  api.addTokens(tokens, bals);
}

async function tvlChain(chain, block, _1, _2, { api }) {
  const contracts = Object.entries(chainContracts[chain]);
  if (!contracts.length) return;

  try {
    const oftAddresses = contracts.map(([_, addr]) => addr);
    const vaultContracts = contracts.map(([name, _]) => streamVaults[vaultMapping[name].vault]);

    const mainnetApi = new api.constructor({ chain: 'ethereum', block: null });

    const totalSupplies = await api.multiCall({
      abi: 'erc20:totalSupply',
      calls: oftAddresses,
      chain,
      permitFailure: true
    });

    const rounds = await mainnetApi.multiCall({
      abi: abi.round,
      calls: vaultContracts,
      permitFailure: false
    });

    const pricePerShares = await mainnetApi.multiCall({
      abi: abi.roundPricePerShare,
      calls: vaultContracts.map((target, i) => ({
        target,
        params: rounds[i] ? [BigInt(rounds[i]) - 1n] : [0n]
      })),
      permitFailure: true
    });

    const assets = contracts.map(([name, _]) => chainTokens[chain][vaultMapping[name].asset]);
    
    for (let i = 0; i < contracts.length; i++) {
      if (!totalSupplies[i] || !pricePerShares[i] || !assets[i]) continue;
      const tvl = (BigInt(totalSupplies[i]) * BigInt(pricePerShares[i])) / BigInt(1e18);
      api.addTokens(assets[i], tvl);
    }
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
