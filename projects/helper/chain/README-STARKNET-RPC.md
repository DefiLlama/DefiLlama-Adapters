# Starknet RPC Failover Infrastructure

## Overview

The Starknet RPC infrastructure provides automatic failover across multiple RPC providers using circuit breaker pattern. This ensures 99.9%+ uptime for all 45 Starknet adapters.

## Architecture

### Providers (Priority Order)

1. **Primary: Lava Network**
   - Endpoint: `https://rpc.starknet.lava.build/`
   - Rate Limit: 30 req/sec per IP
   - Cost: Free forever
   - No API key required

2. **Secondary: dRPC**
   - Endpoint: `https://starknet.drpc.org`
   - Rate Limit: 40-250 RPS (dynamic)
   - Cost: Free tier
   - No API key required

3. **Tertiary: Chainstack (Optional)**
   - Endpoint: `https://starknet-mainnet.core.chainstack.com/<API_KEY>`
   - Rate Limit: 25 RPS (free tier)
   - Cost: 3M requests/month free
   - Requires API key (set `CHAINSTACK_STARKNET_KEY` env var)

### Circuit Breaker Configuration

- **Timeout**: 10 seconds per request
- **Error Threshold**: 50% error rate
- **Volume Threshold**: Min 10 requests before circuit trips
- **Reset Timeout**: 30 seconds cooldown before retry
- **Rolling Window**: 60 seconds for statistics

### Failover Logic

```
Request → Lava (fail) → Retry Lava (fail) → Switch to dRPC → Success
   ↑          ↓              ↓                      ↓
Success   Wait 1s±jitter  Circuit opens      Return result
```

## Configuration

### Environment Variables

```bash
# Primary endpoint (default: Lava)
STARKNET_RPC=https://rpc.starknet.lava.build/

# Secondary endpoint (default: dRPC)
STARKNET_RPC_FALLBACK_1=https://starknet.drpc.org

# Tertiary endpoint (optional, Chainstack)
STARKNET_RPC_FALLBACK_2=https://starknet-mainnet.core.chainstack.com/<KEY>
CHAINSTACK_STARKNET_KEY=<your-api-key>

# Debug logging
DEBUG=true  # Enable debug logs
```

### AWS Lambda Configuration

```yaml
environment:
  STARKNET_RPC: "https://rpc.starknet.lava.build/"
  STARKNET_RPC_FALLBACK_1: "https://starknet.drpc.org"
  # Optional: Add Chainstack as tertiary fallback
  CHAINSTACK_STARKNET_KEY: "${ssm:/defillama/chainstack-starknet-key}"
```

## Monitoring

### Logs

All RPC calls emit structured JSON logs:

```json
{
  "level": "info",
  "message": "Starknet RPC request succeeded",
  "chain": "starknet",
  "provider": "lava",
  "attempt": 1,
  "timestamp": 1732550400000
}
```

### Circuit Events

```json
{
  "level": "warn",
  "message": "Starknet RPC circuit opened",
  "chain": "starknet",
  "provider": "lava",
  "errorRate": 0.62,
  "stats": { "totalRequests": 50, "failedRequests": 31 }
}
```

### CloudWatch Insights Queries

**Query: Circuit Open Events**
```
fields @timestamp, provider, errorRate, stats.failedRequests
| filter chain = "starknet" and message = "Starknet RPC circuit opened"
| sort @timestamp desc
| limit 50
```

**Query: Provider Failure Rate**
```
fields @timestamp, provider, stats.errorRate
| filter chain = "starknet"
| stats avg(stats.errorRate) as avgErrorRate by provider
| sort avgErrorRate desc
```

**Query: Failover Frequency**
```
fields @timestamp, provider, nextProvider
| filter chain = "starknet" and message = "Starknet RPC call failed, trying next provider"
| stats count() as failoverCount by provider, nextProvider
```

## Testing

### Integration Tests

```bash
# Test with current block
node test.js projects/myswap-cl/index.js

# Test with historical timestamp
node test.js projects/myswap-cl/index.js 1729080692
```

### Chaos Testing

Temporarily disable Lava endpoint to test failover:

```bash
# Set Lava to invalid endpoint
export STARKNET_RPC=https://invalid.endpoint.test/
export STARKNET_RPC_FALLBACK_1=https://starknet.drpc.org

# Run adapter - should failover to dRPC
node test.js projects/myswap-cl/index.js
```

Expected logs:
```
{"level":"warn","message":"Starknet RPC call failed, trying next provider","provider":"lava"}
{"level":"info","message":"Starknet RPC call succeeded","provider":"drpc"}
```

## Adapter Usage

**No changes required!** Adapters continue using the same API:

```javascript
const { call, multiCall, sumTokens } = require('../helper/chain/starknet');

async function tvl(api) {
  // Automatic failover handled internally
  return sumTokens({ api, owner: factory, tokens: tokenList });
}
```

## Troubleshooting

### All Providers Failing

**Symptoms**: Adapter returns error `All Starknet RPC providers failed`

**Diagnosis**:
1. Check CloudWatch logs for circuit state
2. Verify provider endpoints are accessible
3. Check if Starknet network is experiencing outages

**Solutions**:
- Add additional fallback endpoint via `STARKNET_RPC_FALLBACK_2`
- Increase circuit breaker timeout
- Check rate limits not exceeded

### High Failover Rate

**Symptoms**: Logs show frequent provider switching

**Diagnosis**:
1. Check if primary provider (Lava) is unstable
2. Verify rate limits not exceeded
3. Check circuit breaker stats

**Solutions**:
- Swap provider order (make dRPC primary)
- Add additional providers
- Reduce request concurrency

### Slow Response Times

**Symptoms**: Adapters taking >30s to complete

**Diagnosis**:
1. Check which provider is being used
2. Verify timeout settings appropriate
3. Check network latency to providers

**Solutions**:
- Add faster provider (requires API key)
- Optimize adapter logic (reduce RPC calls)
- Increase timeout for specific providers

## Rollback Plan

If circuit breaker causes issues, you can disable it via environment variable:

```bash
# Disable circuit breaker (use direct RPC call)
export DISABLE_STARKNET_CIRCUIT_BREAKER=true
```

Or temporarily revert to single provider:

```javascript
// In starknet.js, comment out makeRpcCall and restore:
const STARKNET_RPC = getEnv('STARKNET_RPC');
const { data } = await axios.post(STARKNET_RPC, body);
```

## Performance Impact

Expected changes after deployment:

- ✅ **Uptime**: 99.9%+ (from ~95% with single provider)
- ✅ **Failover Time**: <30s automatic recovery
- ⚠️ **Lambda Duration**: +100-500ms overhead per adapter (circuit breaker logic)
- ⚠️ **Cold Start**: +50-100ms (opossum initialization)
- ✅ **Cost**: Minimal (<1% increase, free tier providers)

## References

- [Opossum Circuit Breaker Docs](https://nodeshift.dev/opossum/)
- [Lava Network Starknet](https://www.lavanet.xyz/get-started/starknet)
- [dRPC Starknet Endpoint](https://drpc.org/chainlist/starknet-mainnet-rpc)
- [Chainstack Starknet RPC](https://chainstack.com/build-better-with-starknet/)
- [GitHub Issue #16952](https://github.com/DefiLlama/DefiLlama-Adapters/issues/16952)

## Support

For issues or questions:
- GitHub Issues: [DefiLlama/DefiLlama-Adapters](https://github.com/DefiLlama/DefiLlama-Adapters/issues)
- Reference Issue: #16952
