const sdk = require("@defillama/sdk");
const BN = require("bignumber.js");

const { sumTokens2 } = require("../../helper/unwrapLPs");
const abi = require("./abis");
const {
  VAULTS_ADDRESSES,
  BAYC_VAULTS,
  MAYC_VAULTS,
  BAYC_APE_STAKING_STRATEGY,
  MAYC_APE_STAKING_STRATEGY,
  BAKC_BAYC_STAKING_STRATEGY,
  BAKC_MAYC_STAKING_STRATEGY,
  APE_STAKING,
  APE,
  BAKC,
  JPEG,
  PETH_ETH_PAIR,
  PETH_ETH_VAULT,
  LP_STAKING,
  helperToNftMapping,
  artBlockOwners,
} = require("./addresses");

async function getApeDepositAddresses(api) {
  const [baycPositionIndices, maycPositionIndices] = await Promise.all([
    api.multiCall({
      abi: abi.VAULT_ABI.openPositionIndices,
      calls: BAYC_VAULTS,
    }),
    api.multiCall({
      abi: abi.VAULT_ABI.openPositionIndices,
      calls: MAYC_VAULTS,
    }),
  ]);

  const [baycOwners, maycOwners] = await Promise.all([
    api.multicall({
      abi: "address:positionOwner",
      calls: baycPositionIndices
        .map((vaultIndices, i) =>
          vaultIndices.map((nftIndex) => ({
            target: BAYC_VAULTS[i],
            params: [nftIndex.toString()],
          }))
        )
        .flat(),
    }),
    api.multicall({
      abi: "address:positionOwner",
      calls: maycPositionIndices
        .map((vaultIndices, i) =>
          vaultIndices.map((nftIndex) => ({
            target: MAYC_VAULTS[i],
            params: [nftIndex.toString()],
          }))
        )
        .flat(),
    }),
  ]);

  const [baycDepositAddresses, maycDepositAddresses] = await Promise.all([
    api.call({
      target: BAYC_APE_STAKING_STRATEGY,
      abi: "address:depositAddress",
      params: Array.from(new Set(baycOwners)),
    }),
    api.call({
      target: MAYC_APE_STAKING_STRATEGY,
      abi: "address:depositAddress",
      params: Array.from(new Set(maycOwners)),
    }),
  ]);
  return Array.from(new Set(baycDepositAddresses)).concat(
    Array.from(new Set(maycDepositAddresses))
  );
}

/**
 * @returns the amount of JPEG locked on JPEG'd (trait or ltv boosts)
 */
async function getLockedJpegAmount(api) {
  const providersAddresses = await api.multiCall({
    abi: "address:nftValueProvider",
    calls: VAULTS_ADDRESSES,
  });

  const results = await api.multiCall({
    target: JPEG,
    abi: "erc20:balanceOf",
    calls: [...new Set(providersAddresses)],
  });
  const lockedJpeg = results.reduce((total, lockedJpegBN) => {
    const amountBN = new BN(lockedJpegBN.toString());
    return new BN(total).plus(amountBN).toFixed();
  }, "0");

  return new BN(lockedJpeg).toFixed();
}

/**
 * @returns the amount of pETH/ETH LP tokens staked in the Citadel
 */
async function getCitadelPethLpAmount(api) {
  const [balanceBN, exchangeRateBN] = await Promise.all([
    api.call({
      abi: "erc20:balanceOf",
      target: PETH_ETH_VAULT,
      params: [LP_STAKING],
    }),
    api.call({
      abi: "uint256:exchangeRate",
      target: PETH_ETH_VAULT,
    }),
  ]);

  const receiptTokenBalance = new BN(balanceBN.toString()).toFixed();
  const exchangeRate = new BN(exchangeRateBN.toString()).div(1e18).toFixed();
  const pethLpAmount = new BN(receiptTokenBalance)
    .times(exchangeRate)
    .toFixed(0);

  return pethLpAmount;
}

/**
 * @returns the amount of $APE tokens staked on JPEG'd
 */
async function getStakedApeAmount(api) {
  const apeDepositAddresses = await getApeDepositAddresses(api);
  const apeStakes = await api.multicall({
    target: APE_STAKING,
    abi: "uint256:stakedTotal",
    params: apeDepositAddresses,
  });

  const totalApeStaked = apeStakes.reduce((total, apeStake) => {
    const balance = new BN(apeStake.toString());
    return new BN(total).plus(balance).toFixed();
  }, "0");

  return totalApeStaked;
}

async function getWalletStakedBakcCount(api) {
  const apeDepositAddresses = await getApeDepositAddresses(api);
  const bakcBalances = await api.multiCall({
    target: BAKC,
    method: "erc721:balanceOf",
    params: apeDepositAddresses,
  });

  const bakcIdsBN = await api.multiCall({
    target: BAKC,
    abi: "erc721:tokenOfOwnerByIndex",
    params: apeDepositAddresses
      .map((owner, i) =>
        Array.from({ length: bakcBalances[i].toString() }).map((_, j) => [
          owner,
          j,
        ])
      )
      .flat(),
  });

  const bakcIds = Array.from(new Set(bakcIdsBN.map((id) => id.toString())));
  const ownerBakcIndexTuples = bakcIds.map((bakcId) => [
    "0x0000000000000000000000000000000000000000", // random owner address, it's not used. just for consistent parameters
    bakcId.toString(),
  ]);

  const [isNonLegacyBaycStaked, isNonLegacyMaycStaked] = await Promise.all([
    api.multiCall({
      target: BAKC_BAYC_STAKING_STRATEGY,
      abi: "address:isDeposited",
      params: ownerBakcIndexTuples,
    }),
    api.multiCall({
      target: BAKC_MAYC_STAKING_STRATEGY,
      abi: "address:isDeposited",
      params: ownerBakcIndexTuples,
    }),
  ]);

  const bakcCount = bakcIds.reduce((total, _, i) => {
    const legacyBakc = !isNonLegacyBaycStaked[i] && !isNonLegacyMaycStaked[i];
    return total + (legacyBakc ? 1 : 0);
  }, 0);

  return bakcCount;
}

/**
 * NFTs deposited in the JPEG'd Vaults
 */
async function vaultsTvl(balances, { api }) {
  // Fetch nftIndices from vaults
  const [openPositionIndices, tokens, nftValueProviders] = await Promise.all([
    api.multiCall({
      calls: VAULTS_ADDRESSES,
      abi: abi.VAULT_ABI.openPositionIndices,
    }),
    api.multiCall({
      abi: "address:nftContract",
      calls: VAULTS_ADDRESSES,
    }),
    api.multiCall({
      abi: "address:nftValueProvider",
      calls: VAULTS_ADDRESSES,
    }),
  ]);

  // keccak256 hash of the traits
  const nftTypes = await Promise.all(
    nftValueProviders.map((providerAddress, i) =>
      api.multiCall({
        abi: abi.PROVIDER_ABI.nftType,
        calls: openPositionIndices[i].map((nftId) => ({
          target: providerAddress,
          params: [nftId],
        })),
      })
    )
  );

  // hash to value muliplier Rate{numerator, denominator}
  const multipliers = await Promise.all(
    nftValueProviders.map((providerAddress, i) =>
      api.multiCall({
        abi: abi.PROVIDER_ABI.nftTypeValueMultiplier,
        calls: nftTypes[i].map((nftType) => ({
          target: providerAddress,
          params: [nftType],
        })),
      })
    )
  );

  // value multiplier or 1
  tokens
    .map((i) => i.toLowerCase())
    .forEach((v, i) => {
      if (artBlockOwners.has(v)) return;
      const multiplierValue = multipliers[i].reduce((total, multiplierRate) => {
        const multiplier =
          BN(multiplierRate.numerator).gt(0) &&
          BN(multiplierRate.denominator).gt(0)
            ? BN(multiplierRate.numerator.toString())
                .div(multiplierRate.denominator.toString())
                .toNumber()
            : 1;
        return total + multiplier;
      }, 0);

      sdk.util.sumSingleBalance(
        balances,
        helperToNftMapping[v.toLowerCase()] || v,
        multiplierValue,
        api.chain
      );
    });
}
async function tvl(ts, b, cb, { api }) {
  const balances = {};
  const vaultsBalances = {};

  const [
    stakedApeAmount,
    stakedBakcAmount,
    lockedJpegAmount,
    stakedPethLpAmount,
    _,
  ] = await Promise.all([
    getStakedApeAmount(api),
    getWalletStakedBakcCount(api),
    getLockedJpegAmount(api),
    getCitadelPethLpAmount(api),
    vaultsTvl(vaultsBalances, { api }),
  ]);

  sdk.util.sumSingleBalance(balances, APE, stakedApeAmount, api.chain);
  sdk.util.sumSingleBalance(balances, BAKC, stakedBakcAmount, api.chain);
  sdk.util.sumSingleBalance(
    balances,
    JPEG.toLowerCase(),
    lockedJpegAmount,
    api.chain
  );
  sdk.util.sumSingleBalance(
    balances,
    PETH_ETH_PAIR.toLowerCase(),
    stakedPethLpAmount,
    api.chain
  );
  sdk.util.mergeBalances(balances, vaultsBalances);

  const tvl = await sumTokens2({
    api,
    balances,
    resolveArtBlocks: true,
    owners: [...artBlockOwners],
  });

  return {
    ...tvl,
  };
}

module.exports = {
  tvl,
};
