const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokens2 } = require('../helper/unwrapLPs');

const config = {
  bsc: {
    tadTokens: {
      tadNUSA: {
        cToken: '0x657d6a52D0599ABd8faa928FDd92772F8fd76b29',
        underlying: '0xe11F1D5EEE6BE945BeE3fa20dBF46FeBBC9F4A19'
      },
      tadTAD: {
        cToken: '0x684EB9b9675B9999F4b50038Ce7151E68f111ca6',
        underlying: '0x9f7229aF0c4b9740e207Ea283b9094983f78ba04'
      },
      tadBTCB: {
        cToken: '0x1Cac8038a7D9101C6922Ba8659D1e9db0115744d',
        underlying: '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c'
      },
      tadETH: {
        cToken: '0x962dadb67698591De4a39B9645a9Ac4581696f1C',
        underlying: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8'
      },
      tadSOL: {
        cToken: '0x033695315b4861005287faBac2978BB59a18caF3',
        underlying: '0x570A5D26f7765Ecb712C0924E4De545B89fD43dF' 
      },
      tadMATIC: {
        cToken: '0x11c11ae37E67330f987207f5Bf7366ceBE8e7564',
        underlying: '0xCC42724C6683B7E57334c4E856f4c9965ED682bD' 
      },
      tadDOGE: {
        cToken: '0x3115e4a0221059920551FdcB667CC33EDbB177Eb',
        underlying: '0xba2ae424d960c26247dd6c32edc70b295c744c43' 
      },
      tadUSDT: {
        cToken: '0x7d611B1B0B70Fcf0678d44893418301c712C868E',
        underlying: '0x55d398326f99059fF775485246999027B3197955' 
      },
      tadBUSD: {
        cToken: '0x2E92aBCf2816b7b1b9628cAA8d840f5Bb60c6Bb2',
        underlying: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56' 
      },
      tadIDRT: {
        cToken: '0x687B24d75Dd47c337D549A2713D58f0719DeA9FE',
        underlying: '0x66207E39bb77e6B99aaB56795C7c340C08520d83' 
      },
      tadBNB: {
        cToken: '0x3f01C2b4A090Fa8BD36e87B78e0d75e37d2d5D90',
        underlying: ADDRESSES.bsc.WBNB
      },
      tadLYFE: {
        cToken: '0x45c2d71938A1f5A031cCaE2D0E9f8143832280aF',
        underlying: '0x8D235B68EfF3D6a227AE3617999f7645ecf13285' 
      },
      tadLLAND: {
        cToken: '0xf4d85957b98d33505e4E6292E90A6D6529507987',
        underlying: '0x865a6a709af8edc4cd3087a6cef02175d88b6347' 
      },
      tadLGOLD: {
        cToken: '0x0a9eB580cbf5A3667984579CCd08D7c8D82BcA0A',
        underlying: '0xdE9165BDcde72279A42EF6B49ABEBcbba9d43b1D' 
      },
      tadLSILVER: {
        cToken: '0x47Df8235D6bF14341Ac768b8De1BadF820d43371',
        underlying: '0x5de0133fbc15998df81443fa9199ed64ad8505c5' 
      },
      tadKUNCI: {
        cToken: '0x5668aC39164534dE0824dE2978A32DbA124eb086',
        underlying: '0x6cf271270662be1C4fc1b7BB7D7D7Fc60Cc19125' 
      },
      tadMMETA: {
        cToken: '0x03ee344103260ec9C35446Ad166304032b177BC4',
        underlying: '0x7a9c8d33963AeCcA9a821802Adfaf5Bd9392351F' 
      },
      tadNBT: {
        cToken: '0xF4bcc63D6f6B5ED79d7914a13Db1B81a46175277',
        underlying: '0x1D3437E570e93581Bd94b2fd8Fbf202d4a65654A' 
      },
      tadDFG: {
        cToken: '0xdE338C1E9503A980212f7fF861625baCe9b2FF7e',
        underlying: '0xB661F4576D5e0B622fEe6ab041Fd5451Fe02BA4C' 
      },
      tadSTRM: {
        cToken: '0xF82013F32f2474DC1Ac41EECa075872C31D21eeA',
        underlying: '0xC598275452fA319d75ee5f176FD3B8384925b425'
      },
      tadKRD: {
        cToken: '0x14C046969C1440B602345360828bbf104a7479fa',
        underlying: '0xb020805e0Bc7F0e353D1343d67A239F417D57Bbf'
      },
      tadVCG: {
        cToken: '0xBC7A4ca260B55466dE17Ce2aC0cd9c8fe258516b',
        underlying: '0x1F36FB2D91d9951Cf58aE4c1956C0b77e224F1E9'
      },
      tadCAKE: {
        cToken: '0xe4B0550b9A4Ef44223eeA89D513208B34C248F6F',
        underlying: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82'
      },
      tadBABYDOGE: {
        cToken: '0xC925Bf16962db4E6D7f2Dcb8518bB945263D602E',
        underlying: '0xc748673057861a797275CD8A068AbB95A902e8de'
      },
      tadSKUY: {
        cToken: '0xd86d2e6efAe3c80c8939DcEaA3B346BA2b36293F',
        underlying: '0x71d03A620646f8b572282Ef39228D36Add67ee20'
      },
      tadDEFI: {
        cToken: '0xe788783E22104Abf5e3993a5E822182D5e53E57D',
        underlying: '0x6d106C0B8d2f47c5465bdBD58D1Be253762cBBC1'
      },
      tadIDRX: {
        cToken: '0xEe9f10f5b66eA1b1d700bbA96CA12Aee832A5A02',
        underlying: '0x649a2DA7B28E0D54c13D5eFf95d3A660652742cC'
      }
    }
  },
  lisk: {
    tadTokens_lisk: {
      nETH: {
        cToken: '0xDeFDb8648F38eaFeaF2786ddC7E76d49AE53E8c1',
        underlying: ADDRESSES.lisk.WETH
      },
      nLSK: {
        cToken: '0xb7a1ed095DC782243CabEEb976333ad03dA97c33',
        underlying: ADDRESSES.lisk.LSK
      },
      nIDRX: {
        cToken: '0x824822ADA8DB1113f9C7Ad81c66A6d5F21cF8C9F',
        underlying: '0x18Bc5bcC660cf2B9cE3cd51a404aFe1a0cBD3C22' 
      },
      nUSDT: {
        cToken: '0x672ce30822389a4A6E7a0f66189d3078eC7AbFCb',
        underlying: ADDRESSES.lisk.USDT
      }
    }
  }
};

async function bscTvl(_, _b, _cb, { api }) {
  const { tadTokens } = config.bsc;
  const allCTokens = Object.values(tadTokens);

  const supplies = await api.multiCall({
    abi: 'erc20:totalSupply',
    calls: allCTokens.map(t => t.cToken)
  });

  const exchangeRates = await api.multiCall({
    abi: 'function exchangeRateCurrent() returns (uint256)',
    calls: allCTokens.map(t => t.cToken)
  });

  allCTokens.forEach((token, i) => {
    if (!token.underlying) {
      return;
    }
    
    const supply = supplies[i];
    const exchangeRate = exchangeRates[i];
    
    const underlyingBalance = (BigInt(supply) * BigInt(exchangeRate) / (10n ** 18n));
    
    api.add(token.underlying, underlyingBalance);
  });

  return sumTokens2({ api });
}

async function liskTvl(_, _b, _cb, { api }) {
  const { tadTokens_lisk } = config.lisk;
  const allCTokens = Object.values(tadTokens_lisk);

  const supplies = await api.multiCall({
    abi: 'erc20:totalSupply',
    calls: allCTokens.map(t => t.cToken),
    permitFailure: true
  });
  
  const validTokens = allCTokens.filter(t => t.underlying && t.underlying !== ADDRESSES.null);
  const exchangeRates = await api.multiCall({
    abi: 'function exchangeRateCurrent() returns (uint256)',
    calls: validTokens.map(t => t.cToken),
    permitFailure: true
  });
  
  validTokens.forEach((token, i) => {
    const supply = supplies[i];
    const exchangeRate = exchangeRates[i];
    
    if (!supply || !exchangeRate) {
      return;
    }
    
    const underlyingBalance = (BigInt(supply) * BigInt(exchangeRate)) / (10n ** 18n);
    
    api.add(token.underlying, underlyingBalance);
  });

  return sumTokens2({ api });
}

module.exports = {
  bsc: { tvl: bscTvl },
  lisk: { tvl: liskTvl },
  methodology: `
    TVL is calculated by:
    1. Taking the total supply of all cTokens
    2. Getting the exchange rate of each cToken to its underlying asset
    3. Calculating the locked underlying value: (totalSupply * exchangeRate) / 1e18
    4. The underlying values are summed up as TVL
  `
};