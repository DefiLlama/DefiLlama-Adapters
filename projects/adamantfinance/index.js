const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { stakings } = require("../helper/staking");
const { getConfig } = require('../helper/cache')
const { unwrapLPsAuto, sumTokens2, } = require("../helper/unwrapLPs");
const {
  getChainTransform,
} = require("../helper/portedTokens");
const { staking: stakingUnknown, } = require("../helper/unknownTokens");

const vaultsUrl = {
  polygon:
    "https://raw.githubusercontent.com/eepdev/vaults/main/current_vaults.json",
  arbitrum:
    "https://raw.githubusercontent.com/eepdev/vaults/main/arbitrum_vaults.json",
  cronos:
    "https://raw.githubusercontent.com/eepdev/vaults/main/cronos_vaults.json",
};

/*** Polygon Addresses ***/
const stakingContracts_polygon = [
  "0x920f22E1e5da04504b765F8110ab96A20E6408Bd",
];

const vaultAddresses_polygon = ["0xF7661EE874Ec599c2B450e0Df5c40CE823FEf9d3"]; //ADDY/WETH staking contract

const lpAddresses_polygon = ["0xa5bf14bb945297447fe96f6cd1b31b40d31175cb"]; //ADDY/WETH

const ADDY = "0xc3fdbadc7c795ef1d6ba111e06ff8f16a20ea539";

/*** Arbitrum Addresses ***/
const stakingContracts_Arbitrum = [
  "0x097b15dC3Bcfa7D08ea246C09B6A9a778e5b007B",
  "0xc5fFd083B983AAF823a9b485b207F898ed2f32DC",
  "0x9d5d0cb1B1210d4bf0e0FdCC6aCA1583fA48f0fD",
];

const lpAddresses_arbitrum = [];
const ARBY = ADDRESSES.arbitrum.ARBY

/*** Cronos Addresses ***/
const stakingContracts_cronos = [
  "0x3f04D6bD50A79c854EF42965471D34E389eB5CDd",
  "0xD4bcCf04a7CA546D3cfC46205AA7C58EB98c7495",
  "0x323663B759567BAf744C182634585F7164c3c442",
];
const CADDY = ADDRESSES.arbitrum.ARBY;

const vaultAddresses_cronos = [
  "0x3a9645ee664DCE6529Af678aaB4fE3AD9d68323f",
  "0x6681EDBf50C0758C719F3024C282de1694807CcB",
];

const lpAddresses_cronos = [
  "0x332937463df26f46a1a715a41205765774beef80", //CADDY-WCRO Cronos
  "0x2a008ef8ec3ef6b03eff10811054e989aad1cf71", //CADDY-WCRO Cronos
];


async function pool2Polygon(api) {
  const bals = await api.multiCall({  abi: 'erc20:totalSupply', calls: vaultAddresses_polygon})
  const tokens = await api.multiCall({  abi: 'address:stakingToken', calls: vaultAddresses_polygon})
  api.addTokens(tokens, bals)
  return sumTokens2({ api, resolveLP: true })
}

async function polygonTvl(timestamp, block, chainBlocks) {
  return await tvl(timestamp, "polygon", chainBlocks, lpAddresses_polygon);
}

async function arbitrumTvl(timestamp, block, chainBlocks) {
  return await tvl(timestamp, "arbitrum", chainBlocks, lpAddresses_arbitrum);
}

async function cronosTvl(timestamp, block, chainBlocks) {
  return await tvl(timestamp, "cronos", chainBlocks, lpAddresses_cronos);
}

async function uniTvl(balances, chain, block, uniVaults, lpAddressesIgnored, transformAddress = (a) => a) {
  const vault_balances = (
    await sdk.api.abi.multiCall({
      chain: chain,
      block: block,
      calls: uniVaults.map((vault) => ({
        target: vault.vaultAddress,
      })),
      abi: abi.balance,
    })
  ).output.map((val) => val.output);

  uniVaults.forEach((v, idx) => {
    if (
      !lpAddressesIgnored.some(
        (addr) => addr.toLowerCase() === v.lpAddress.toLowerCase()
      )
    ) {
      sdk.util.sumSingleBalance(balances, chain + ':' + v.lpAddress, vault_balances[idx])
    }
  });

  await unwrapLPsAuto({ balances, block, chain, });
  return balances;
}

const tvl = async (timestamp, chain, chainBlocks, lpAddressesIgnored) => {

  const block = chainBlocks[chain];
  const transformAddress = await getChainTransform(chain)
  let balances = {};

  let resp = await getConfig('adamant-fi/'+chain, vaultsUrl[chain]);

  let uniVaults = resp
    .filter(
      (vault) =>
        vault.vaultAddress !== '0x459dc0fB79653A48469F2C3c375d0A522750Dd40' &&
        vault.platform !== "dodo"
    )
    .map((vault) => ({
      vaultAddress: vault.vaultAddress,
      lpAddress: vault.lpAddress,
    }));
  balances = await uniTvl(balances, chain, block, uniVaults, lpAddressesIgnored, transformAddress);

  return balances;
};

module.exports = {
  polygon: {
    staking: stakings(stakingContracts_polygon, ADDY),
    pool2: pool2Polygon,
    tvl: polygonTvl,
  },
  arbitrum: {
    staking: stakings(stakingContracts_Arbitrum, ARBY),
    tvl: arbitrumTvl,
  },
  cronos: {
    staking: stakingUnknown({ owners: stakingContracts_cronos, tokens: [CADDY], chain: 'cronos', lps: lpAddresses_cronos, useDefaultCoreAssets: true }),
    tvl: cronosTvl,
  },
  methodology:
    "The current vaults on Adamant Finance are found on the Github. Once we have the vaults, we filter out the LP addresses of each vault and unwrap the LPs so that each token can be accounted for. Coingecko is used to price the tokens and the sum of all tokens is provided as the TVL",
};
