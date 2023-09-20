const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require("../helper/staking");
const { sumTokens2 } = require("../helper/unwrapLPs");

const TigrisAddresses = {
  arbitrum: {
    TIG: "0x3A33473d7990a605a88ac72A78aD4EFC40a54ADB",
    xTIG: "0x19694Cf64572e6adf643Ae7B13d5b2921215B4E5",
    // tigUSD and USDT are 1:1 exchangeable via stable vault
    tigUSD: "0x7E491F53bF807f836E2dd6C4A4FBd193e1913EFd",
    USDT: ADDRESSES.arbitrum.USDT,
    TigStaking: "0x6E8BFBb31A46D0F5502426050Ea28b19F8E761f4",
    TokenSale: "0x45F52502aF87e7e4E446BA15BDf223A19b47DA98",
    StableVault: "0xe82fcefbDD034500B5862B4827CAE5c117f6b921",
    Treasury: "0xf416c2b41fb6c592c9ba7cb6b2f985ed593a51d7",
    Lock: "0x76e0c3bda3dD22A2cFDCdbCafdaC997927F80483",
    TeamVesting: "0x97F1b43ED98587B2ab5A649aa63Ecc28403282bC",
  },
  polygon: {
    TIG: "0x7157Fe7533f2fc77498755Cc253d79046c746560",
    TigStaking: "0xC6c32eD781450228dFadfa49A430d7868B110F44",
    // tigUSD and DAI are 1:1 exchangeable via stable vault
    tigUSD: "0x76973Ba2AFF24F87fFE41FDBfD15308dEBB8f7E8",
    DAI: ADDRESSES.polygon.DAI,
    StableVault: "0x3677415Dc23e49B7780ef46976F418F4a9d5031B",
    Treasury: "0x4f7046f36B5D5282A94cB448eAdB3cdf9Ff2b051",
    Lock: "0x638e39D4a927EfE3040F0f6D4d27e4CccD8c996A",
    Bond: "0xC5d9B681086b2617626B0Ed05A7D632660Fc99f4",
  },
};

async function arbitrumTvl(_, _b, _cb, { api }) {
  const tokensAndOwners = [
    [TigrisAddresses.arbitrum.USDT, TigrisAddresses.arbitrum.StableVault],
  ];
  return sumTokens2({ api, tokensAndOwners });
}

async function polygonTvl(_, _b, _cb, { api }) {
  const tokensAndOwners = [
    [TigrisAddresses.polygon.DAI, TigrisAddresses.polygon.StableVault],
  ];
  return sumTokens2({ api, tokensAndOwners });
}

module.exports = {
  arbitrum: {
    staking: staking(
      TigrisAddresses.arbitrum.TigStaking,
      TigrisAddresses.arbitrum.TIG
    ),
    tvl: arbitrumTvl,
  },
  polygon: {
    staking: staking(
      TigrisAddresses.polygon.TigStaking,
      TigrisAddresses.polygon.TIG
    ),
    tvl: polygonTvl,
  },
};
