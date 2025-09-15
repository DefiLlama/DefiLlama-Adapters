const fetch = require("node-fetch");

async function fetchData() {
  // curl -X POST https://api.xdock.meme/api/trade/dashboard -H "Authorization: Ye8Y1y57rHo4WKlYHm8o9v88tX"
  const res = await fetch("https://api.xdock.meme/api/trade/dashboard", {
    method: "POST",
    headers: {
      "Authorization": "Ye8Y1y57rHo4WKlYHm8o9v88tX",
      "Content-Type": "application/json",
    }
  });
  const data = await res.json();
  if (data.code != 0) {
    console.log("data", data);
    throw new Error(data.msg);
  }

  return {
    totalVolume: data.totalVolume,
    totalFee: data.totalFee, // OKB
    totalCreatorFee: data.totalCreatorFee, // OKB
    totalListFee: data.totalListFee, // OKB
    totalCreated: data.totalCreated,
    totalCompleted: data.totalCompleted,
    totalAddresses: data.totalAddresses,
  };
}
fetchData()

module.exports = {
  methodology: "We fetch data from our backend API which aggregates on-chain events of AmmPool.",
  fetch: fetchData,
};
