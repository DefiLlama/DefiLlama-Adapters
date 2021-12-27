const axios = require("axios");
const puppeteer = require("puppeteer");

var os = require("os");

const fs = require("fs");

const checkUnknownSnapshot = (
  friktionSnapshotUnknown /*: unknown*/
) /*:  friktionSnapshotUnknown is FriktionSnapshot */ => {
  let result =
    friktionSnapshotUnknown &&
    typeof friktionSnapshotUnknown === "object" &&
    hasOwnProperty(friktionSnapshotUnknown, "totalTvlUSD") &&
    typeof friktionSnapshotUnknown.totalTvlUSD === "number" &&
    hasOwnProperty(friktionSnapshotUnknown, "coinsByCoingeckoId") &&
    friktionSnapshotUnknown.coinsByCoingeckoId !== null &&
    typeof friktionSnapshotUnknown.coinsByCoingeckoId === "object" &&
    Object.keys(friktionSnapshotUnknown.coinsByCoingeckoId).length > 5 &&
    Object.values(friktionSnapshotUnknown.coinsByCoingeckoId).every(
      (v) => typeof v === "number"
    ) &&
    hasOwnProperty(friktionSnapshotUnknown.coinsByCoingeckoId, "solana") &&
    typeof friktionSnapshotUnknown.coinsByCoingeckoId["solana"] === "number" &&
    friktionSnapshotUnknown.coinsByCoingeckoId["solana"] > 5000 &&
    hasOwnProperty(friktionSnapshotUnknown.coinsByCoingeckoId, "bitcoin") &&
    typeof friktionSnapshotUnknown.coinsByCoingeckoId["bitcoin"] === "number" &&
    friktionSnapshotUnknown.coinsByCoingeckoId["bitcoin"] > 100;
  return result /* as boolean*/;
};

function hasOwnProperty(obj, prop) {
  return obj.hasOwnProperty(prop);
}

async function tvl() {
  const sleep = () => new Promise((resolve) => setTimeout(resolve, 5000));

  const browser = await puppeteer.launch({
    headless: os.userInfo().username === "runner",
  });

  let maxFriktionSnapshot /*: FriktionSnapshot */ = {
    totalTvlUSD: 0,
    coinsByCoingeckoId: {},
  };

  const useLocalhost = fs.existsSync("DRY_RUN_SNAPSHOT");

  // Run three times just in case there is a problem with RPC rate limiting
  for (let i = 0; i < 3; i++) {
    const page = await browser.newPage();
    try {
      await page.goto(
        useLocalhost ? "http://localhost:3000/" : "https://app.friktion.fi"
      );

      let friktionSnapshot /*: FriktionSnapshot | undefined */;
      for (let i = 0; i < 200; i++) {
        const friktionSnapshotUnknown = await page.evaluate(
          // @ts-ignore
          () => window.friktionSnapshot
        );
        await sleep(100);

        if (checkUnknownSnapshot(friktionSnapshotUnknown)) {
          friktionSnapshot = friktionSnapshotUnknown;
          break;
        }
      }
      console.log("Trial", i, friktionSnapshot);

      if (friktionSnapshot) {
        if (friktionSnapshot.totalTvlUSD > maxFriktionSnapshot.totalTvlUSD) {
          maxFriktionSnapshot = friktionSnapshot;
        }
        for (const [coingeckoId, amount] of Object.entries(
          friktionSnapshot.coinsByCoingeckoId
        )) {
          if (!maxFriktionSnapshot.coinsByCoingeckoId[coingeckoId]) {
            maxFriktionSnapshot.coinsByCoingeckoId[coingeckoId] = 0;
          }
          if (amount > maxFriktionSnapshot.coinsByCoingeckoId[coingeckoId]) {
            maxFriktionSnapshot.coinsByCoingeckoId[coingeckoId] += amount;
          }
        }
      }
    } catch (e) {
      console.log(e);
    }
    await page.close();
    await sleep(5000);
  }
  await browser.close();

  console.log(maxFriktionSnapshot);

  // Yes, there are other properties, but those aren't as critical
  if (
    maxFriktionSnapshot.totalTvlUSD > 10_000_000 &&
    Object.keys(maxFriktionSnapshot.coinsByCoingeckoId).length > 5
  ) {
    return maxFriktionSnapshot.coinsByCoingeckoId;
  } else {
    throw new Error("maxFriktionSnapshot didn't pass checks");
  }
}

module.exports = {
  timetravel: false,
  methodology:
    "TVL is scraped from the a hidden variable called window.friktionSnapshot on friktion.fi. The data exact same as what is displayed on the app",
  tvl,
};
