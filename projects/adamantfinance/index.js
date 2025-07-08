const ADDRESSES = require('../helper/coreAssets.json')
const { stakings } = require("../helper/staking");
const { getConfig } = require('../helper/cache')
const { sumTokens2, } = require("../helper/unwrapLPs");
const { staking: stakingUnknown, } = require("../helper/unknownTokens");

const vaultsUrl = {
  polygon:
    "https://raw.githubusercontent.com/eepdev/vaults/main/current_vaults.json",
  arbitrum:
    "https://raw.githubusercontent.com/eepdev/vaults/main/arbitrum_vaults.json",
  cronos:
    "https://raw.githubusercontent.com/eepdev/vaults/main/cronos_vaults.json",
  fraxtal:
    "https://raw.githubusercontent.com/eepdev/vaults/main/current_vaults_all_chains.json"
};

const allVaultsUrl = "https://raw.githubusercontent.com/eepdev/vaults/main/current_vaults_all_chains.json";

/*** Polygon Addresses ***/
const stakingContracts_polygon = [
  "0x920f22E1e5da04504b765F8110ab96A20E6408Bd",
];

const vaultAddresses_polygon = ["0xF7661EE874Ec599c2B450e0Df5c40CE823FEf9d3"]; //ADDY/WETH staking contract

const lpAddresses_polygon = ["0xa5bf14bb945297447fe96f6cd1b31b40d31175cb"]; //ADDY/WETH

const ADDY = "0xc3fdbadc7c795ef1d6ba111e06ff8f16a20ea539";
const adMESH = "0x459dc0fB79653A48469F2C3c375d0A522750Dd40";

/*** Arbitrum Addresses ***/
const stakingContracts_Arbitrum = [
  "0x097b15dC3Bcfa7D08ea246C09B6A9a778e5b007B",
  "0xc5fFd083B983AAF823a9b485b207F898ed2f32DC",
  "0x9d5d0cb1B1210d4bf0e0FdCC6aCA1583fA48f0fD",
];

const ARBY = ADDRESSES.arbitrum.ARBY

/*** Cronos Addresses ***/
const stakingContracts_cronos = [
  "0x3f04D6bD50A79c854EF42965471D34E389eB5CDd",
  "0xD4bcCf04a7CA546D3cfC46205AA7C58EB98c7495",
  "0x323663B759567BAf744C182634585F7164c3c442",
];
const CADDY = ADDRESSES.arbitrum.ARBY;

const lpAddresses_cronos = [
  "0x332937463df26f46a1a715a41205765774beef80", //CADDY-WCRO Cronos
  "0x2a008ef8ec3ef6b03eff10811054e989aad1cf71", //CADDY-WCRO Cronos
];


async function pool2Polygon(api) {
  const bals = await api.multiCall({ abi: 'erc20:totalSupply', calls: vaultAddresses_polygon })
  const tokens = await api.multiCall({ abi: 'address:stakingToken', calls: vaultAddresses_polygon })
  api.addTokens(tokens, bals)
  return sumTokens2({ api, resolveLP: true })
}

const blacklistedTokens = [
  ...lpAddresses_polygon,
  ...lpAddresses_cronos,
]

const blacklistedOwners = new Set([
  adMESH,
  "0x01d2833e6d86D5Ad8380044DEb2cA520fc60D326", //adMESH related token/deposit
  "0xbe6aa0AF32984fE3f65a73071DECC09Ab607e310", //adMESH related token/deposit
].map(i => i.toLowerCase()))

const tvl = async (api) => {
  let info = await getConfig('adamant-fi/allVaults', allVaultsUrl)
  if (api.chain === 'arbitrum') {
    info = await getConfig('adamant-fi/arbitrumVaults', vaultsUrl.arbitrum)

    info = info.filter((vault) => vault.platform !== "dodo" && !blacklistedOwners.has(vault.lpAddress.toLowerCase())
    )
  } else {
    info = info
      .filter((vault) => vault.platform !== "dodo" && vault.chainId == api.chainId && !blacklistedOwners.has(vault.lpAddress.toLowerCase()))
  }


  const tokens = info.map(i => i.lpAddress)
  const vaults = info.map(i => i.vaultAddress)
  const bals = await api.multiCall({ abi: "uint256:balance", calls: vaults, permitFailure: true, })
  api.addTokens(tokens, bals.map(i => i ?? 0))
  for (const token of blacklistedTokens)
    api.removeTokenBalance(token)
  return sumTokens2({ api, resolveLP: true })
};

module.exports = {
  polygon: {
    staking: stakings(stakingContracts_polygon, ADDY),
    pool2: pool2Polygon,
    tvl,
  },
  arbitrum: {
    staking: stakings(stakingContracts_Arbitrum, ARBY),
    tvl,
  },
  cronos: {
    staking: stakingUnknown({ owners: stakingContracts_cronos, tokens: [CADDY], chain: 'cronos', lps: lpAddresses_cronos, useDefaultCoreAssets: true }),
    tvl,
  },
  fraxtal: { tvl, },
  methodology:
    "The current vaults on Adamant Finance are found on the Github. Once we have the vaults, we filter out the LP addresses of each vault and unwrap the LPs so that each token can be accounted for. Coingecko is used to price the tokens and the sum of all tokens is provided as the TVL",
};
