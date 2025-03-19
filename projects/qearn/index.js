const { fetchQuerySC, getBalance } = require("../helper/chain/qubic");
const { QubicHelper } = require("@qubic-lib/qubic-ts-library/dist/qubicHelper");
const { sumTokensExport } = require('../helper/unwrapLPs');

function uint8ArrayToBase64(uint8Array) {
  const binaryString = String.fromCharCode.apply(null, Array.from(uint8Array));
  return btoa(binaryString);
};

function base64ToUint8Array(base64) {
  const binaryString = atob(base64);
  return new Uint8Array(binaryString.split("").map((char) => char.charCodeAt(0)));
};

const qHelper = new QubicHelper();
const QearnAddress = "JAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVKHO";

// Query
const getLockInfoPerEpoch = async (epoch) => {
  const view = new DataView(new Uint8Array(4).buffer);
  view.setUint32(0, epoch, true);

  const res = await fetchQuerySC({
    contractIndex: 9,
    inputType: 1,
    inputSize: 4,
    requestData: uint8ArrayToBase64(new Uint8Array(view.buffer))
  });

  if (!res.responseData) {
    return {
      lockAmount: 0,
      bonusAmount: 0,
      currentLockedAmount: 0,
      currentBonusAmount: 0,
      yieldPercentage: 0
    };
  }

  const responseView = new DataView(base64ToUint8Array(res.responseData).buffer);
  const getValue = (offset) => Number(responseView.getBigUint64(offset, true));

  return {
    lockAmount: getValue(0),
    bonusAmount: getValue(8),
    currentLockedAmount: getValue(16),
    currentBonusAmount: getValue(24),
    yieldPercentage: getValue(32)
  };
};

const getUserLockInfo = async (user, epoch) => {
  if (typeof user === "string") {
    user = qHelper.getIdentityBytes(user);
  }

  const view = new DataView(new Uint8Array(36).buffer);
  user.forEach((byte, index) => view.setUint8(index, byte));
  view.setUint32(32, epoch, true);

  const res = await fetchQuerySC({
    contractIndex: 9,
    inputType: 2,
    inputSize: 36,
    requestData: uint8ArrayToBase64(new Uint8Array(view.buffer))
  });

  if (!res.responseData) return 0;

  return Number(new DataView(base64ToUint8Array(res.responseData).buffer).getBigUint64(0, true));
};

const getStateOfRound = async (epoch) => {
  const view = new DataView(new Uint8Array(4).buffer);
  view.setUint32(0, epoch, true);

  const res = await fetchQuerySC({
    contractIndex: 9,
    inputType: 3,
    inputSize: 4,
    requestData: uint8ArrayToBase64(new Uint8Array(view.buffer))
  });

  if (!res.responseData) return { state: 0 };

  return {
    state: new DataView(base64ToUint8Array(res.responseData).buffer).getUint32(0, true)
  };
};

const getUserLockStatus = async (user, currentEpoch) => {
  if (typeof user === "string") {
    user = qHelper.getIdentityBytes(user);
  }

  const view = new DataView(new Uint8Array(32).buffer);
  user.forEach((byte, index) => view.setUint8(index, byte));

  const res = await fetchQuerySC({
    contractIndex: 9,
    inputType: 4,
    inputSize: 32,
    requestData: uint8ArrayToBase64(new Uint8Array(view.buffer))
  });

  if (!res.responseData) return [];

  const state = Number(new DataView(base64ToUint8Array(res.responseData).buffer).getBigUint64(0, true));

  return state
    .toString(2)
    .split("")
    .reverse()
    .reduce((epochs, bit, index) => (bit === "1" ? [...epochs, currentEpoch - index] : epochs), []);
};

const getEndedStatus = async (user) => {
  if (typeof user === "string") {
    user = qHelper.getIdentityBytes(user);
  }

  const view = new DataView(new Uint8Array(32).buffer);
  user.forEach((byte, index) => view.setUint8(index, byte));

  const res = await fetchQuerySC({
    contractIndex: 9,
    inputType: 5,
    inputSize: 32,
    requestData: uint8ArrayToBase64(new Uint8Array(view.buffer))
  });

  if (!res.responseData) return {};

  const responseView = new DataView(base64ToUint8Array(res.responseData).buffer);
  const getValue = (offset) => Number(responseView.getBigUint64(offset, true));

  return {
    fullUnlockedAmount: getValue(0),
    fullRewardedAmount: getValue(8),
    earlyUnlockedAmount: getValue(16),
    earlyRewardedAmount: getValue(24)
  };
};

const getBurnedAndBoostedStats = async () => {
  const res = await fetchQuerySC({
    contractIndex: 9,
    inputType: 7,
    inputSize: 0,
    requestData: ""
  });

  if (!res.responseData)
    return {
      burnedAmount: 0,
      averageBurnedPercent: 0,
      boostedAmount: 0,
      averageBoostedPercent: 0,
      rewardedAmount: 0,
      averageRewardedPercent: 0
    };

  const responseView = new DataView(base64ToUint8Array(res.responseData).buffer);
  const getValue = (offset) => Number(responseView.getBigUint64(offset, true));

  return {
    burnedAmount: getValue(0),
    averageBurnedPercent: getValue(8),
    boostedAmount: getValue(16),
    averageBoostedPercent: getValue(24),
    rewardedAmount: getValue(32),
    averageRewardedPercent: getValue(40)
  };
};

const getBurnedAndBoostedStatsPerEpoch = async (epoch) => {
  const view = new DataView(new Uint8Array(4).buffer);
  view.setUint32(0, epoch, true);

  const res = await fetchQuerySC({
    contractIndex: 9,
    inputType: 8,
    inputSize: 4,
    requestData: uint8ArrayToBase64(new Uint8Array(view.buffer))
  });

  if (!res.responseData)
    return {
      burnedAmount: 0,
      burnedPercent: 0,
      boostedAmount: 0,
      boostedPercent: 0,
      rewardedAmount: 0,
      rewardedPercent: 0
    };

  const responseView = new DataView(base64ToUint8Array(res.responseData).buffer);
  const getValue = (offset) => Number(responseView.getBigUint64(offset, true));

  return {
    burnedAmount: getValue(0),
    burnedPercent: getValue(8),
    boostedAmount: getValue(16),
    boostedPercent: getValue(24),
    rewardedAmount: getValue(32),
    rewardedPercent: getValue(40)
  };
};

async function staking() {
  return {
    "qubic": 21234123412
  }
}


module.exports = {
  start: '2025-03-15', 
  qubic: { 
    tvl: async()=>({})
  },
};
