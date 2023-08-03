const ADDRESSES = require('../helper/coreAssets.json')
const { sumUnknownTokens } = require("../helper/unknownTokens");
const { staking } = require('../helper/staking')
const WSGB = ADDRESSES.songbird.WSGB
const CANARY_DOLLAR = ADDRESSES.songbird.CAND
 const EXFI = ADDRESSES.songbird.EXFI;
 const SFIN = ADDRESSES.songbird.SFIN;

const chain = 'songbird'

async function farmTvl(timestamp, ethblock, { [chain]: block }) {
  const tokens = [
    [WSGB, "0x6BA0F675EB2f169D15764D5cf10C4EF0e9e059f2"], 
    [EXFI, "0xc9231AB30b2B39c1f7f79132D7a44bBF0F8144B0"], 
    [CANARY_DOLLAR, "0x32b36B0A8B74Ac9212946a99e0af727848D5A3A1"], 
    ["0xC6D2f9e21bcD963B42D85379581003be1146b3Aa", "0x02785B7CE6Eb9A5858561DDAB64cCBE5c478b730"],
    ["0x07852D5C7fd1d630Dd79148A195aaAF72241680D", "0x50756c69CAC800a3fA03d130721CDa02Aa0fEF69"],
    ["0xb5bf334b8cc30b8b13fc035d171d77a217aab091", "0x864201b2227Ee23f0875c5D3Fc49F4F0ec59aC19"],
    ["0x47c830e141234d029d953df39b13d7728eb9f2d4", "0x921E8f58cF517d289c01BCBE800c2d31838c1a28"],
    [EXFI, "0xad72C1483bBAB54B7f4e0024f6D4b437a69DA48b"],
    [EXFI, "0xbEDfFd817383147616131ED38B7030277609d8B7"],
    [EXFI, "0x6FD8A1a58645aaB92Aa6858b42a8dd985714fE15"],
    [EXFI, "0x7e48Db2b486Cf90150421cBdcA401B86833F5333"],
    ["0x47C830E141234d029D953dF39B13d7728eB9f2d4", "0xc387818C274a365D973AAb8287498350757D7b1f"],
    ['0xB5BF334B8Cc30B8B13fc035d171D77A217aaB091','0x53Fb520ea993C58dB5035b3a00FABB0dc8fE3CA4'],
    ['0x47C830E141234d029D953dF39B13d7728eB9f2d4','0xb4bD741343727EcBdACDE37124D869104b0AcAf8'],
    ['0xC6D2f9e21bcD963B42D85379581003be1146b3Aa','0x1d1FAD6faAFc6a5Cd6652fFA7BA43F9E4fa75C0d'],
    [EXFI, '0xD02C3e166223EE78F4d0ae99F5396142b48D97FE'], 
    [WSGB, '0x745d8896629842ef8E44D269f89A7A873086A6F2'],
    [EXFI, "0x61128b44C299b0f7a752BF6278f44f1EcefD9109"],
    ['0x3233642aCf7664a69c33e5a6FFAb321608d7A65f','0xF81B465C562ED3f54Aea772D8A56FAF93884ea2E'],
    [EXFI, "0x3B346b0b091fA8813f60Cd6e81b95b63375e22f5"],
    ['0xc41aA3ac0e6efcb780cd4696E7eC3B8193BB46E1', "0xa275DD75C1182055C7039b839cC0Da017c78933a"]
  ];

  return sumUnknownTokens({ tokensAndOwners: tokens, chain, block, useDefaultCoreAssets: true, })
}

async function pool2(timestamp, ethblock, { [chain]: block }) {
  const tokens = [
    ["0xcd15c231b8a0bae40bd7938ae5ea8e43f1e9a15f", "0x0732f6B4aBE5dB2127E671E4B218d340b6af169c"],
    ["0xcd15c231b8a0bae40bd7938ae5ea8e43f1e9a15f", "0x3b343A6FC05B699F48CBe6FF127C0af8e2aA9EEE"],
    ["0xcd15c231b8a0bae40bd7938ae5ea8e43f1e9a15f", "0x782BdE5353FAcFab1eBeC1803f2a575346193B30"],
    ["0x48195ca4d228ce487ae2ae1335b017a95493ade6", "0xc5478a1d5914cF9D0Ee20Da21459502eCb7E1646"],
    ["0x48195ca4d228ce487ae2ae1335b017a95493ade6", "0x9185D70f17eC13897D780601708b1b1F36A75d32"],
    ["0xcd15c231b8a0bae40bd7938ae5ea8e43f1e9a15f", "0xD262AFf2Bb76f05cf470a7D935E717eEbA8ef799"],
    ["0x5D4e155CA27e8DAd4E4aceE48F83B6E0E4AFEec0", "0x2379FD47f100828382fFeaF26381Ba6608f7Bf73"],
    ["0x5D4e155CA27e8DAd4E4aceE48F83B6E0E4AFEec0", "0xC1ecfEA1148f9506FF10E9Ecf76F40884b4987Cc"], 
    ["0xcd15c231b8a0bae40bd7938ae5ea8e43f1e9a15f", "0xDa78E41813Cc2468bAA74ad3E84b35b7FedF42bD"]
  ]
  return sumUnknownTokens({ tokensAndOwners: tokens, chain, block, useDefaultCoreAssets: true, })
}

module.exports = {
  misrepresentedTokens: true,
  methodology: `Gets token balance from the smart contract address holding the user deposits. These addresses are are labele "tokensAndOwners". SFIN staked to earn more SFIN is labeles as "staking" category`,
  songbird: {
    tvl: farmTvl,
    pool2,
    staking: staking(['0x554742076743b366504972F86609d64fd18BDC34', '0xd0dbAFF52224C0882cfaf1765f347Cb5e4364FA1'], SFIN),
  }
};