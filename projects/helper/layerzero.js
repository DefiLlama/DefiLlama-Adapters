const { AbiCoder, ZeroAddress } = require('ethers');

const ENDPOINT_V2 = '0x1a44076050125825900e736c501f859c50fE728c';
const ULN_CONFIG_TYPE = 2;

const abiCoder = AbiCoder.defaultAbiCoder();
const ulnConfigType = 'tuple(uint64 confirmations,uint8 requiredDVNCount,uint8 optionalDVNCount,uint8 optionalDVNThreshold,address[] requiredDVNs,address[] optionalDVNs)';

async function getSendUlnConfig(api, { oapp, dstEid, endpoint = ENDPOINT_V2 }) {
  const sendLib = await api.call({
    target: endpoint,
    abi: 'function getSendLibrary(address sender, uint32 eid) view returns (address)',
    params: [oapp, dstEid],
  });

  const encodedConfig = await api.call({
    target: endpoint,
    abi: 'function getConfig(address oapp, address lib, uint32 eid, uint32 configType) view returns (bytes)',
    params: [oapp, sendLib, dstEid, ULN_CONFIG_TYPE],
  });

  const [config] = abiCoder.decode([ulnConfigType], encodedConfig);

  const requiredDVNCount = Number(config.requiredDVNCount);
  const optionalDVNCount = Number(config.optionalDVNCount);
  const requiredDVNs = Array.from(config.requiredDVNs);
  const optionalDVNs = Array.from(config.optionalDVNs);

  assertDvnArrayValid(requiredDVNs, requiredDVNCount, 'required');
  assertDvnArrayValid(optionalDVNs, optionalDVNCount, 'optional');
  assertNoDuplicateDvns([...requiredDVNs, ...optionalDVNs]);

  return {
    confirmations: Number(config.confirmations),
    requiredDVNCount,
    optionalDVNCount,
    optionalDVNThreshold: Number(config.optionalDVNThreshold),
    requiredDVNs,
    optionalDVNs,
    sendLib,
  };
}

function assertDvnArrayValid(dvns, declaredCount, label) {
  if (dvns.length !== declaredCount) {
    throw new Error(`LayerZero ${label} DVN config malformed: declared count ${declaredCount}, actual length ${dvns.length}`);
  }
  if (dvns.some(addr => addr.toLowerCase() === ZeroAddress.toLowerCase())) {
    throw new Error(`LayerZero ${label} DVN config contains zero-address verifier (KelpDAO-style spoof guard)`);
  }
}

function assertNoDuplicateDvns(dvns) {
  const lowered = dvns.map(a => a.toLowerCase());
  if (new Set(lowered).size !== lowered.length) {
    throw new Error('LayerZero DVN config contains duplicate verifier; quorum would overstate independent signers');
  }
}

function getMinimumVerifierQuorum(config) {
  return config.requiredDVNCount + config.optionalDVNThreshold;
}

function getEscrowDstEids(escrow) {
  const rawEids = escrow.dstEids ?? (escrow.dstEid != null ? [escrow.dstEid] : null);
  if (!Array.isArray(rawEids) || !rawEids.length) {
    throw new Error('LayerZero escrow entries require dstEid or non-empty dstEids');
  }
  return [...new Set(rawEids)];
}

async function escrowMeetsQuorum(api, escrow, minDvnQuorum) {
  const configs = await Promise.all(
    getEscrowDstEids(escrow).map(dstEid => getSendUlnConfig(api, { ...escrow, dstEid }))
  );
  return configs.every(config => getMinimumVerifierQuorum(config) >= minDvnQuorum);
}

async function getIncludedEscrows(api, { escrows, minDvnQuorum }) {
  if (!Number.isInteger(minDvnQuorum) || minDvnQuorum < 1) {
    throw new Error('sumLayerZeroEscrows requires minDvnQuorum (>= 1). Opting out re-introduces post-KelpDAO risk; see issue #18926.');
  }
  if (!Array.isArray(escrows)) {
    throw new Error('sumLayerZeroEscrows requires escrows to be an array');
  }

  const includedEscrows = [];
  for (const escrow of escrows) {
    if (!escrow?.oapp || !escrow?.token || !escrow?.owner) {
      throw new Error('LayerZero escrow entries require owner, token, and oapp');
    }
    if (await escrowMeetsQuorum(api, escrow, minDvnQuorum)) includedEscrows.push(escrow);
  }

  return includedEscrows;
}

function sumLayerZeroEscrows({ escrows, minDvnQuorum } = {}) {
  return async function tvl(api) {
    const includedEscrows = await getIncludedEscrows(api, { escrows, minDvnQuorum });
    return api.sumTokens({
      tokensAndOwners: includedEscrows.map(({ token, owner }) => [token, owner]),
    });
  };
}

module.exports = {
  getMinimumVerifierQuorum,
  getSendUlnConfig,
  sumLayerZeroEscrows,
};
