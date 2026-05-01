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
  const lowered = dvns.map(a => a.toLowerCase());
  if (new Set(lowered).size !== lowered.length) {
    throw new Error(`LayerZero ${label} DVN config contains duplicate verifier; quorum count would overstate independent signers`);
  }
}

function getMinimumVerifierQuorum(config) {
  return config.requiredDVNCount + config.optionalDVNThreshold;
}

async function getIncludedEscrows(api, { escrows, minDvnQuorum }) {
  if (typeof minDvnQuorum !== 'number' || minDvnQuorum < 1) {
    throw new Error('sumLayerZeroEscrows requires minDvnQuorum (>= 1). Opting out re-introduces post-KelpDAO risk; see issue #18926.');
  }

  const includedEscrows = [];
  for (const escrow of escrows) {
    if (!escrow.oapp || !escrow.dstEid) throw new Error('LayerZero DVN gating requires oapp and dstEid per escrow');

    const config = await getSendUlnConfig(api, escrow);
    if (getMinimumVerifierQuorum(config) >= minDvnQuorum) includedEscrows.push(escrow);
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
