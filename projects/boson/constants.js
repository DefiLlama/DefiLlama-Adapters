const protocolDiamondAddress = "0x59A4C19b55193D5a2EAD0065c54af4d516E18Cb5";

const protocolDeploymentBlock = {
  polygon: 34258150,
  ethereum: 18240548,
  base: 25765296,
  arbitrum: 321778899,
  optimism: 133002790,
};

/** Event topics **/
const fundsDepositedTopic =
  "0x862dfcd9710943e66ad8f1f01a99cc98ab5612a09e62ecc68f63fe2e0f86cb0e";
const fundsEncumberedTopic =
  "0x8080d30eb13935d67dfdc606fa5e4170aa03ffdfaf40136ef3fa4355c88b19f9";
const offerCreatedTopic_v2_0_0 =
  "0x845c99b8425be384387e239b85d44b6cdf63aab6c45c2534f799743e341c74f8";
const offerCreatedTopic_v2_3_0 =
  "0xb6a507882e43ec6bae2f276ce4a839f1ca9dcf2da73095eea9e633e96ecf6eb2";
const offerCreatedTopic_v2_4_0 =
  "0xa76af238b31b285c9397e2a7c55650ca18a1baf6504de15d7dd1321693144cf7";
const offerCreatedTopic_v2_5_0 =
  "0x5235a4f9db2e479e7353e22e7629a4556897ddaf0ab4eaeb9bb8660c8e49a903";
const offerVoidedTopic =
  "0xe7c7f2b8b4a6597a3aa617aff2d206ea5507c118fb6d4e54e130279510796fd5";

const buyerCommittedTopic_v2_0_0 =
  "0x442279a0d0683a12971990518f9f3f874391650139a762c4e94b23b51f04d94f";
const buyerCommittedTopic_v2_5_0 =
  "0xb52015a0ea2e0345baee81bf183c410328b8f8d0cfd380c43006bb84b78fc100";

/** Event definitions **/
/**
 * Some event changed over time, but kept their name, so we define multiple versions here
 */
const OfferCreatedEvent_v2_0_0 =
  "event OfferCreated(uint256 indexed offerId, uint256 indexed sellerId, (uint256 id, uint256 sellerId, uint256 price, uint256 sellerDeposit, uint256 buyerCancelPenalty, uint256 quantityAvailable, address exchangeToken, string metadataUri, string metadataHash, bool voided) offer, (uint256 validFrom, uint256 validUntil, uint256 voucherRedeemableFrom, uint256 voucherRedeemableUntil) offerDates, (uint256 disputePeriod, uint256 voucherValid, uint256 resolutionPeriod) offerDurations, (uint256 disputeResolverId, uint256 escalationResponsePeriod, uint256 feeAmount, uint256 buyerEscalationDeposit) disputeResolutionTerms, (uint256 protocolFee, uint256 agentFee) offerFees, uint256 indexed agentId, address executedBy)";
const OfferCreatedEvent_v2_3_0 =
  "event OfferCreated(uint256 indexed offerId, uint256 indexed sellerId, (uint256 id, uint256 sellerId, uint256 price, uint256 sellerDeposit, uint256 buyerCancelPenalty, uint256 quantityAvailable, address exchangeToken, string metadataUri, string metadataHash, bool voided, uint256 collectionIndex) offer, (uint256 validFrom, uint256 validUntil, uint256 voucherRedeemableFrom, uint256 voucherRedeemableUntil) offerDates, (uint256 disputePeriod, uint256 voucherValid, uint256 resolutionPeriod) offerDurations, (uint256 disputeResolverId, uint256 escalationResponsePeriod, uint256 feeAmount, uint256 buyerEscalationDeposit) disputeResolutionTerms, (uint256 protocolFee, uint256 agentFee) offerFees, uint256 indexed agentId, address executedBy)";
const OfferCreatedEvent_v2_4_0 =
  "event OfferCreated(uint256 indexed offerId, uint256 indexed sellerId, (uint256 id, uint256 sellerId, uint256 price, uint256 sellerDeposit, uint256 buyerCancelPenalty, uint256 quantityAvailable, address exchangeToken, uint8 priceType, string metadataUri, string metadataHash, bool voided, uint256 collectionIndex, (address[] recipients, uint256[] bps)[] royaltyInfo) offer, (uint256 validFrom, uint256 validUntil, uint256 voucherRedeemableFrom, uint256 voucherRedeemableUntil) offerDates, (uint256 disputePeriod, uint256 voucherValid, uint256 resolutionPeriod) offerDurations, (uint256 disputeResolverId, uint256 escalationResponsePeriod, uint256 feeAmount, uint256 buyerEscalationDeposit) disputeResolutionTerms, (uint256 protocolFee, uint256 agentFee) offerFees, uint256 indexed agentId, address executedBy)";
const OfferCreatedEvent_v2_5_0 =
  "event OfferCreated(uint256 indexed offerId, uint256 indexed sellerId, (uint256 id, uint256 sellerId, uint256 price, uint256 sellerDeposit, uint256 buyerCancelPenalty, uint256 quantityAvailable, address exchangeToken, uint8 priceType, uint8 creator, string metadataUri, string metadataHash, bool voided, uint256 collectionIndex, (address[] recipients, uint256[] bps)[] royaltyInfo, uint256 buyerId) offer, (uint256 validFrom, uint256 validUntil, uint256 voucherRedeemableFrom, uint256 voucherRedeemableUntil) offerDates, (uint256 disputePeriod, uint256 voucherValid, uint256 resolutionPeriod) offerDurations, (uint256 disputeResolverId, uint256 escalationResponsePeriod, uint256 feeAmount, uint256 buyerEscalationDeposit, address mutualizerAddress) disputeResolutionTerms, (uint256 protocolFee, uint256 agentFee) offerFees, uint256 indexed agentId, address executedBy)";
const OfferVoidedEvent =
  "event OfferVoided(uint256 indexed offerId, uint256 indexed creatorId, address indexed executedBy)";

const FundsDepositedEvent =
  "event FundsDeposited(uint256 indexed entityId, address indexed executedBy, address indexed tokenAddress, uint256 amount)";
const FundsEncumberedEvent =
  "event FundsEncumbered(uint256 indexed entityId, address indexed exchangeToken, uint256 amount, address indexed executedBy)";

const BuyerCommittedEvent_v2_0_0 =
  "event BuyerCommitted(uint256 indexed offerId, uint256 indexed buyerId, uint256 indexed exchangeId, (uint256 id, uint256 offerId, uint256 buyerId, uint256 finalizedDate, uint8 state) exchange, (uint256 committedDate, uint256 validUntilDate, uint256 redeemedDate, bool expired) voucher, address executedBy)";
const BuyerCommittedEvent_v2_5_0 =
  "event BuyerCommitted(uint256 indexed offerId, uint256 indexed buyerId, uint256 indexed exchangeId, (uint256 id, uint256 offerId, uint256 buyerId, uint256 finalizedDate, uint8 state, address mutualizerAddress) exchange, (uint256 committedDate, uint256 validUntilDate, uint256 redeemedDate, bool expired) voucher, address executedBy)";

module.exports = {
  protocolDiamondAddress,
  protocolDeploymentBlock,
  fundsDepositedTopic,
  fundsEncumberedTopic,
  offerCreatedTopic_v2_0_0,
  offerCreatedTopic_v2_3_0,
  offerCreatedTopic_v2_4_0,
  offerCreatedTopic_v2_5_0,
  offerVoidedTopic,
  buyerCommittedTopic_v2_0_0,
  buyerCommittedTopic_v2_5_0,
  OfferCreatedEvent_v2_0_0,
  OfferCreatedEvent_v2_3_0,
  OfferCreatedEvent_v2_4_0,
  OfferCreatedEvent_v2_5_0,
  OfferVoidedEvent,
  FundsDepositedEvent,
  FundsEncumberedEvent,
  BuyerCommittedEvent_v2_0_0,
  BuyerCommittedEvent_v2_5_0,
};
