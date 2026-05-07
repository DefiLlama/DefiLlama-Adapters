const ADDRESSES = require('../helper/coreAssets.json')

const abi = {
    "cdpTvl": "function cdpTvl(address man, uint256 cdp, bytes32 ilk) view returns (uint256)",
    "cdpi": "function cdpi(address man) view returns (uint256)",
    "avatarLength": "uint256:avatarLength",
    "avatars": "function avatars(uint256) view returns (address)",
    "getAllMarkets": "address[]:getAllMarkets",
    "balanceOfUnderlying": "function balanceOfUnderlying(address owner) returns (uint256)",
    "underlying": "address:underlying",
    "bamms": "function bamms(uint256) view returns (address)",
    "getCompoundedLUSDDeposit": "function getCompoundedLUSDDeposit(address _depositor) view returns (uint256)"
  };

const bTvlAddress = '0x60312e01A2ACd1Dac68838C949c1D20C609B20CF';
const bcdpmanagerAddress = '0x3f30c2381CD8B917Dd96EB2f1A4F96D91324BBed';
const ethIlk = '0x4554482d41000000000000000000000000000000000000000000000000000000';
const registryAddress = "0xbf698df5591caf546a7e087f5806e216afed666a";
const comptrollerAddress = "0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B";
const bKeeperAddress = "0xeaE019ef845A4Ffdb8829210De5D30aC6FbB5371";
const stabilityPoolAddress = "0x66017D22b0f8556afDd19FC67041899Eb65a21bb";

const usdcFantom = ADDRESSES.fantom.USDC
const usdcArbitrum = ADDRESSES.arbitrum.USDC

const daiFantom = ADDRESSES.fantom.DAI

const usdtArbitrum = ADDRESSES.arbitrum.USDT


const usdcFantomBAMM = "0xEDC7905a491fF335685e2F2F1552541705138A3D"
const daiFantomBAMM = "0x6d62d6Af9b82CDfA3A7d16601DDbCF8970634d22"
const usdcArbitrumBAMM = "0x04208f296039f482810B550ae0d68c3E1A5EB719"
const usdtArbitrumBAMM = "0x24099000AE45558Ce4D049ad46DDaaf71429b168"

const hDAIPolygon = "0xE4e43864ea18d5E5211352a4B810383460aB7fcC"
const hUSDCPolygon = "0x607312a5C671D0C511998171e634DE32156e69d0"
const hUSDTPolygon = "0x103f2CA2148B863942397dbc50a425cc4f4E9A27"
const hFRAXPolygon = "0x2c7a9d9919f042C4C120199c69e126124d09BE7c"

const bammDAIPolygon = "0x998Bf304Ce9Cb215F484aA39d1177b8210078f49"
const bammUSDCPolygon = "0x0F0dD66D2d6c1f3b140037018958164c6AB80d56"
const bammUSDTPolygon = "0x1EcF1b0DE9b4c2D01554062eA2faB84b1917B41d"
const bammFRAXPolygon = "0x2DA13538056aFf0bFC81d3A4c6364B0a7e0f9feb"

const polygonHTokens = [hDAIPolygon, hUSDCPolygon, hUSDTPolygon, hFRAXPolygon]
const polygonBamms = [bammDAIPolygon, bammUSDCPolygon, bammUSDTPolygon, bammFRAXPolygon]

async function compoundTvl(api) {
  const avatarsAdresess = await api.fetchList({ lengthAbi: abi.avatarLength, itemAbi: abi.avatars, target: registryAddress })

  // all of Compound's supply & borrow assets adresses
  const cTokens = await api.call({ target: comptrollerAddress, abi: abi["getAllMarkets"] })
  return api.sumTokens({ owners: avatarsAdresess, tokens: cTokens })
}

async function makerTvl(api) {
  const cdpiRes = await api.call({ target: bTvlAddress, params: [bcdpmanagerAddress], abi: abi["cdpi"] });

  const maxCdp = Number(cdpiRes);
  const cdps = Array.from({ length: maxCdp }, (_, i) => i + 1)

  const ethBalances = (await api.multiCall({
    abi: abi["cdpTvl"],
    target: bTvlAddress,
    calls: cdps.map((cdp,) => ({
      params: [bcdpmanagerAddress, cdp, ethIlk]
    })),
  }))
  api.addGasToken(ethBalances)
}

async function liquityTvl(api) {

  for (let i = 0; ; i++) {
    try {
      const bamm = await api.call({ target: bKeeperAddress, params: [i], abi: abi["bamms"] });
      const balance = await api.call({ target: stabilityPoolAddress, params: [bamm], abi: abi["getCompoundedLUSDDeposit"] }); api.add(ADDRESSES.ethereum.LUSD, balance);
    }
    catch {
      break;
    }
  }
}

async function tvlEth(api) {

  await Promise.all([
    compoundTvl(api),
    makerTvl(api),
    liquityTvl(api),
  ])
}

async function tvlFantom(api) {
  return api.sumTokens({
    tokensAndOwners: [
      [usdcFantom, usdcFantomBAMM],
      [daiFantom, daiFantomBAMM],
    ]
  })
}

async function tvlArbitrum(api) {
  return api.sumTokens({
    tokensAndOwners: [
      [usdcArbitrum, usdcArbitrumBAMM],
      [usdtArbitrum, usdtArbitrumBAMM],
    ]
  })
}

async function tvlPolygon(api) {
  const calls = polygonBamms.map((bamm, i) => ({
    target: polygonHTokens[i],
    params: [bamm]
  }))
  const tokens = await api.multiCall({ abi: 'address:underlying', calls: polygonHTokens })
  const bals = await api.multiCall({ abi: abi.balanceOfUnderlying, calls })
  api.add(tokens, bals)
}

module.exports = {
  ethereum: { "tvl": tvlEth },
  fantom: { "tvl": tvlFantom },
  arbitrum: { "tvl": tvlArbitrum },
  polygon: { "tvl": tvlPolygon }
};
