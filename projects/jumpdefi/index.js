const { call } = require("../helper/chain/near");
const axios = require("axios");
const { BigNumber } = require("bignumber.js");
const COLLECTION_IDS = [
  "nft.classykangaroosv2.near",
  "mp.nephilim.near",
  "realbirds.near",
  "nfc.enleap.near",
  "asac.near",
  "mrbrownproject.near",
  "tinkerunion_nft.enleap.near",
  "thebullishbulls.near",
  "cartelgen1.neartopia.near",
];
const NFT_STAKING_CONTRACT = "nftstaking.jumpfinance.near";
async function tvl() {
  let balances = {
    near: "0",
  };
  let promises = [];

  COLLECTION_IDS.forEach((collectionId) => {
    promises.push(getValueLockCollection(collectionId));
  });
  const values = await Promise.allSettled(promises);

  values.forEach((value) => {
    if (value.status === "fulfilled") {
      balances.near = parseFloat(balances.near) + parseFloat(value.value);
    }
  });

  return balances;
}
async function getValueLockCollection(collectionId) {
  const fpFetchURL =
    "https://api-v2-mainnet.paras.id/collections?collection_id=";
  const fpFetch = await axios.get(fpFetchURL + collectionId);
  const fpData = fpFetch.data;
  const nearValuePerNFT = parseFloat(
    new BigNumber(fpData.data.results[0].floor_price)
      .dividedBy(10 ** 24)
      .toFixed(2),
  );
  const nftStaked = await call(collectionId, "nft_supply_for_owner", {
    account_id: NFT_STAKING_CONTRACT,
  });
  const totalValue = parseFloat(nftStaked) * parseFloat(nearValuePerNFT);
  return totalValue;
}

module.exports = {
  timetravel: false,
  near: {
    tvl,
  },
  methodology:
    "Summed up all the tokens deposited in JumpDefi including NFT Staking",
};
