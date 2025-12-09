const { sumTokens2 } = require('../helper/unwrapLPs');
const { getTokenSupplies } = require('../helper/solana');
const { get } = require('../helper/http');

// ---------------- CONFIG ----------------
const config = {
  polygon: [
    '0x834df4C1d8f51Be24322E39e4766697BE015512F',
    '0xC6221856E45ed806F8325a084bED3D69D32C526d',
    '0x46080F31351A6568f44575E3EFfDE7f0C86867f9',
    '0xd574b191B5a00262Ff19953d3CE25543AB7C8098',
    '0xc2C1f8Eb98C0468Be0232DD4166705d0Dea3Fe31'
  ],
  base: [
    '0x834df4C1d8f51Be24322E39e4766697BE015512F',
    '0xC6221856E45ed806F8325a084bED3D69D32C526d',
    '0x46080F31351A6568f44575E3EFfDE7f0C86867f9',
    '0x7ceE47e7B7CD04CF984e8Dd86C42595B5771A9B2',
    '0xc2C1f8Eb98C0468Be0232DD4166705d0Dea3Fe31'
  ],
  solana: [
    'CETES7CKqqKQizuSN6iWQwmTeFRjbJR6Vw2XRKfEDR8f',
    'EuroszHk1AL7fHBBsxgeGHsamUqwBpb26oEyt9BcfZ6G',
    'GiLTSeSFnNse7xQVYeKdMyckGw66AoRmyggGg1NNd4yr',
    'BRNTNaZeTJANz9PeuD8drNbBHwGgg7ZTjiQYrFgWQ48p',
    'USTRYnGgcHAhdWsanv8BG6vHGd4p7UGgoB9NRd8ei7j'
  ],
  stellar: {
    CETES: 'CETES-GCRYUGD5NVARGXT56XEZI5CIFCQETYHAPQQTHO2O3IQZTHDH4LATMYWC',
    EUROB: 'EUROB-GCRYUGD5NVARGXT56XEZI5CIFCQETYHAPQQTHO2O3IQZTHDH4LATMYWC',
    TESOURO: 'TESOURO-GCRYUGD5NVARGXT56XEZI5CIFCQETYHAPQQTHO2O3IQZTHDH4LATMYWC',
    USTRY: 'USTRY-GCRYUGD5NVARGXT56XEZI5CIFCQETYHAPQQTHO2O3IQZTHDH4LATMYWC'
  }
};

// ---------------- SOLANA TVL ----------------
async function solanaTVL(api) {
  await getTokenSupplies(config.solana, api);
}

// ---------------- STELLAR TVL ----------------
async function stellarTVL(api) {
  for (const [tokenName, asset] of Object.entries(config.stellar)) {
    const [code, issuer] = asset.split('-');
    try {
      const res = await get(`https://api.stellar.expert/explorer/public/asset/${code}-${issuer}`);
      if (!res || !res.supply) {
        console.log(`Stellar API returned invalid data for ${asset}:`, res);
        continue;
      }

      // Correct scaling: divide by 10^7 to get actual supply in millions
      const supply = Number(res.supply) / 1e7;
      api.addTokens(asset, supply);
    } catch (err) {
      console.log(`Error fetching Stellar asset ${asset}:`, err);
    }
  }
}

// ---------------- EVM TVL ----------------
function generateEvmTVL(assets) {
  return async (api) => {
    const supplies = await api.multiCall({ abi: 'erc20:totalSupply', calls: assets });
    api.add(assets, supplies);
    return sumTokens2({ api });
  };
}

module.exports = {
  solana: { tvl: solanaTVL },
  stellar: { tvl: stellarTVL },
  polygon: { tvl: generateEvmTVL(config.polygon) },
  base: { tvl: generateEvmTVL(config.base) },
};





