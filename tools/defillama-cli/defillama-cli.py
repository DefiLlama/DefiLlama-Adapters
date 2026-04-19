#!/usr/bin/env python3
"""
DefiLlama Unified CLI & Data Pipeline
Comprehensive command-line interface for querying the DefiLlama ecosystem.
Supports chains, protocols, DEXs, bridges, yields, RPCs, assets, quotes, and more.
"""

import argparse
import json
import os
import sys
import re
import subprocess
from pathlib import Path
from datetime import datetime

# ── Paths ──────────────────────────────────────────────────────────────────────
SCRIPT_DIR = Path(__file__).parent.resolve()
DATA_DIR = SCRIPT_DIR / "defillama_data"
UNIFIED_FILE = DATA_DIR / "unified_defillama.json"
CHAIN_TVL_FILE = DATA_DIR / "chain_tvl.json"
DEXS_FILE = DATA_DIR / "dexs.json"
PROTOCOLS_FILE = DATA_DIR / "protocols.json"
BRIDGES_FILE = DATA_DIR / "bridges.json"
YIELDS_FILE = DATA_DIR / "yields.json"
RPCS_FILE = DATA_DIR / "rpc_list.json"
ASSETS_FILE = DATA_DIR / "assets.json"
REGISTRY_DIR = SCRIPT_DIR / "registry_data"
SEARCH_INDEX = DATA_DIR / "search_index.json"

# ── Registry definitions ──────────────────────────────────────────────────────
REGISTRIES = [
    "aave", "aaveV3", "balancer", "compound", "erc4626", "gmx",
    "masterchef", "solanaStakePool", "stakingOnly", "uniswapV2",
    "uniswapV3", "uniswapV3Graph",
]

# ── Color output ──────────────────────────────────────────────────────────────
class C:
    BOLD = "\033[1m"
    DIM = "\033[2m"
    RED = "\033[91m"
    GREEN = "\033[92m"
    YELLOW = "\033[93m"
    BLUE = "\033[94m"
    MAGENTA = "\033[95m"
    CYAN = "\033[96m"
    RESET = "\033[0m"

def colored(text, color):
    if sys.stdout.isatty():
        return f"{color}{text}{C.RESET}"
    return text

def bold(text):
    return colored(text, C.BOLD)

def dim(text):
    return colored(text, C.DIM)

def cyan(text):
    return colored(text, C.CYAN)

def green(text):
    return colored(text, C.GREEN)

def yellow(text):
    return colored(text, C.YELLOW)

def red(text):
    return colored(text, C.RED)

# ── Helpers ────────────────────────────────────────────────────────────────────
def load_json(path, default=None):
    """Load JSON file, return default on failure."""
    try:
        with open(path) as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return default if default is not None else {}

def save_json(path, data):
    """Save data as JSON."""
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w") as f:
        json.dump(data, f, indent=2, default=str)

def format_number(n, decimals=2):
    """Format large numbers with K/M/B suffixes."""
    if n is None:
        return "N/A"
    if abs(n) >= 1e9:
        return f"${n/1e9:.{decimals}f}B"
    if abs(n) >= 1e6:
        return f"${n/1e6:.{decimals}f}M"
    if abs(n) >= 1e3:
        return f"${n/1e3:.{decimals}f}K"
    return f"${n:.{decimals}f}"

def format_address(addr):
    """Format blockchain address with truncation."""
    if not addr:
        return "N/A"
    if len(addr) > 20:
        return f"{addr[:8]}...{addr[-6:]}"
    return addr

def truncate(s, max_len=60):
    """Truncate string with ellipsis."""
    if not s:
        return ""
    s = str(s)
    if len(s) <= max_len:
        return s
    return s[:max_len-3] + "..."

def match_search(text, query):
    """Case-insensitive substring match."""
    if not text or not query:
        return True
    return query.lower() in str(text).lower()

# ── Live API ──────────────────────────────────────────────────────────────────
import urllib.request
import urllib.error
import ssl

API_BASE = "https://api.llama.fi"

def api_get(endpoint, params=None):
    """Fetch from DefiLlama API."""
    url = f"{API_BASE}{endpoint}"
    if params:
        qs = "&".join(f"{k}={v}" for k, v in params.items() if v is not None)
        if qs:
            url += f"?{qs}"
    ctx = ssl.create_default_context()
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "defillama-cli/1.0"})
        with urllib.request.urlopen(req, context=ctx, timeout=15) as resp:
            return json.loads(resp.read().decode())
    except (urllib.error.URLError, json.JSONDecodeError, TimeoutError) as e:
        return {"error": str(e)}

def api_get_coins(endpoint, params=None):
    """Fetch from DefiLlama coins API."""
    url = f"https://coins.llama.fi{endpoint}"
    if params:
        qs = "&".join(f"{k}={v}" for k, v in params.items() if v is not None)
        if qs:
            url += f"?{qs}"
    ctx = ssl.create_default_context()
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "defillama-cli/1.0"})
        with urllib.request.urlopen(req, context=ctx, timeout=15) as resp:
            return json.loads(resp.read().decode())
    except (urllib.error.URLError, json.JSONDecodeError, TimeoutError) as e:
        return {"error": str(e)}

# ── Data source abstraction ───────────────────────────────────────────────────
def get_data_source():
    """Determine data source: local files or live API."""
    return "local" if UNIFIED_FILE.exists() else "api"

# ── Command: chains ───────────────────────────────────────────────────────────
def cmd_chains(args):
    """List/search chains."""
    if args.api or not CHAIN_TVL_FILE.exists():
        data = api_get("/v2/chains")
        if isinstance(data, dict) and "error" in data:
            print(red(f"API error: {data['error']}"))
            return
        chains = data if isinstance(data, list) else []
    else:
        chains = load_json(CHAIN_TVL_FILE, [])

    # Search filter
    if args.search:
        chains = [c for c in chains if match_search(c.get("name", ""), args.search)]

    # Sort
    sort_key = args.sort or "name"
    if sort_key == "dex":
        chains.sort(key=lambda c: c.get("dex_factory_count", 0), reverse=True)
    elif sort_key == "rpc":
        chains.sort(key=lambda c: c.get("rpc_count", 0), reverse=True)
    elif sort_key == "bridge":
        chains.sort(key=lambda c: c.get("bridge_count", 0), reverse=True)
    else:
        chains.sort(key=lambda c: c.get("name", "").lower())

    # Top N
    if args.top:
        chains = chains[:args.top]

    # Output
    if args.json:
        print(json.dumps(chains, indent=2))
        return

    # Table output
    print(bold(f"\n{'Chain':<20} {'DEXes':>8} {'Lending':>8} {'Bridges':>8} {'RPCs':>8} {'Assets':>8}"))
    print("─" * 62)
    for c in chains:
        name = c.get("name", "?")
        dex = c.get("dex_factory_count", 0)
        lend = c.get("lending_count", 0)
        bridge = c.get("bridge_count", 0)
        rpc = c.get("rpc_count", 0)
        assets = "✓" if c.get("has_core_assets") else "─"
        print(f"{name:<20} {dex:>8} {lend:>8} {bridge:>8} {rpc:>8} {assets:>8}")
    print(f"\n{dim(f'Total: {len(chains)} chains')}")

# ── Command: chain ────────────────────────────────────────────────────────────
def cmd_chain(args):
    """Show chain details."""
    name = args.name.lower()

    if args.api or not CHAIN_TVL_FILE.exists():
        chain_data = api_get(f"/v2/chains")
        if isinstance(chain_data, list):
            chain = next((c for c in chain_data if c.get("name", "").lower() == name), None)
        else:
            chain = None
    else:
        chains = load_json(CHAIN_TVL_FILE, [])
        chain = next((c for c in chains if c.get("name", "").lower() == name), None)

    if not chain:
        print(red(f"Chain '{name}' not found."))
        return

    # Enrichment
    dexs = []
    rpcs = []
    assets = {}

    if args.api or not DEXS_FILE.exists():
        all_dexs = api_get("/overview/dexs")
        if isinstance(all_dexs, dict):
            protocols = all_dexs.get("protocols", [])
            dexs = [d for d in protocols if name in [c.lower() for c in d.get("chains", [])]]
    else:
        all_dexs = load_json(DEXS_FILE, [])
        dexs = [d for d in all_dexs if name in [c.lower() for c in d.get("chains", [])]]

    if args.rpcs or args.all:
        if args.api or not RPCS_FILE.exists():
            rpc_data = api_get(f"/v2/chains")
            if isinstance(rpc_data, list):
                chain_rpc = next((c for c in rpc_data if c.get("name", "").lower() == name), {})
                rpcs = chain_rpc.get("rpcs", [])
        else:
            all_rpcs = load_json(RPCS_FILE, {})
            rpcs = all_rpcs.get(name, {}).get("rpcs", [])

    if args.assets or args.all:
        if args.api or not ASSETS_FILE.exists():
            assets = api_get(f"/coins/ethereum/{name}")
        else:
            all_assets = load_json(ASSETS_FILE, {})
            assets = all_assets.get(name, {})

    # Output
    if args.json:
        result = {"chain": chain, "dexs": dexs[:20], "rpcs": rpcs, "assets": assets}
        print(json.dumps(result, indent=2))
        return

    print(bold(f"\n=== {chain.get('name', name).upper()} ===\n"))
    print(f"  TVL: {format_number(chain.get('tvl', 0))}")
    print(f"  DEXes: {len(dexs)}")
    print(f"  Lending: {chain.get('lending_count', 0)}")
    print(f"  Bridges: {chain.get('bridge_count', 0)}")
    print(f"  RPCs: {len(rpcs)}")

    if dexs:
        print(bold("\n  DEXes:"))
        for d in dexs[:15]:
            proto = d.get("protocol", "?")
            ver = d.get("version", "")
            factory = d.get("factory", "")
            addr = format_address(factory) if factory else ""
            print(f"    • {proto} {ver} {dim(addr)}")

    if rpcs:
        print(bold("\n  RPCs:"))
        for r in rpcs[:10]:
            print(f"    • {r}")

# ── Command: protocols ────────────────────────────────────────────────────────
def cmd_protocols(args):
    """List/search protocols."""
    if args.api or not PROTOCOLS_FILE.exists():
        data = api_get("/protocols")
        if isinstance(data, dict) and "error" in data:
            print(red(f"API error: {data['error']}"))
            return
        protocols = data if isinstance(data, list) else []
    else:
        protocols = load_json(PROTOCOLS_FILE, [])

    # Filters
    if args.chain:
        protocols = [p for p in protocols if args.chain.lower() in [c.lower() for c in p.get("chains", [])]]
    if args.category:
        protocols = [p for p in protocols if match_search(p.get("category", ""), args.category)]
    if args.search:
        protocols = [p for p in protocols if match_search(p.get("name", ""), args.search)]

    # Sort by TVL
    protocols.sort(key=lambda p: p.get("tvl", 0) or 0, reverse=True)

    # Top N
    if args.top:
        protocols = protocols[:args.top]

    # Output
    if args.json:
        print(json.dumps(protocols, indent=2))
        return

    print(bold(f"\n{'Protocol':<25} {'Chain':<12} {'TVL':>14} {'Category':<20}"))
    print("─" * 73)
    for p in protocols[:30]:
        name = truncate(p.get("name", "?"), 24)
        chains = ", ".join(p.get("chains", [])[:2])
        tvl = format_number(p.get("tvl", 0))
        cat = truncate(p.get("category", "?"), 19)
        print(f"{name:<25} {chains:<12} {tvl:>14} {cat:<20}")
    print(f"\n{dim(f'Total: {len(protocols)} protocols')}")

# ── Command: protocol ─────────────────────────────────────────────────────────
def cmd_protocol(args):
    """Show protocol details."""
    slug = args.name.lower()

    if args.api or not PROTOCOLS_FILE.exists():
        data = api_get("/protocols")
        if isinstance(data, list):
            proto = next((p for p in data if p.get("slug", "").lower() == slug or p.get("name", "").lower() == slug), None)
        else:
            proto = None
    else:
        protocols = load_json(PROTOCOLS_FILE, [])
        proto = next((p for p in protocols if p.get("slug", "").lower() == slug or p.get("name", "").lower() == slug), None)

    if not proto:
        print(red(f"Protocol '{slug}' not found."))
        return

    if args.json:
        print(json.dumps(proto, indent=2))
        return

    print(bold(f"\n=== {proto.get('name', '?')} ===\n"))
    print(f"  Category: {proto.get('category', 'N/A')}")
    print(f"  Chains: {', '.join(proto.get('chains', []))}")
    print(f"  TVL: {format_number(proto.get('tvl', 0))}")
    print(f"  Change 1d: {proto.get('change_1d', 'N/A')}%")
    print(f"  Change 7d: {proto.get('change_7d', 'N/A')}%")
    print(f"  Description: {truncate(proto.get('description', ''), 100)}")
    if proto.get("address"):
        print(f"  Address: {proto['address']}")
    if proto.get("url"):
        print(f"  URL: {proto['url']}")

# ── Command: dexs ─────────────────────────────────────────────────────────────
def cmd_dexs(args):
    """List DEXs."""
    if args.api or not DEXS_FILE.exists():
        data = api_get("/overview/dexs")
        if isinstance(data, dict):
            protocols = data.get("protocols", [])
        else:
            protocols = []
    else:
        protocols = load_json(DEXS_FILE, [])

    # Filters
    if args.chain:
        protocols = [d for d in protocols if args.chain.lower() in [c.lower() for c in d.get("chains", [])]]
    if args.search:
        protocols = [d for d in protocols if match_search(d.get("protocol", ""), args.search)]

    # Sort by volume
    protocols.sort(key=lambda d: d.get("total24h", 0) or 0, reverse=True)

    # Output
    if args.json:
        print(json.dumps(protocols, indent=2))
        return

    print(bold(f"\n{'Protocol':<20} {'Version':<8} {'Chain':<12} {'24h Vol':>14} {'Factory'}"))
    print("─" * 80)
    for d in protocols[:30]:
        name = truncate(d.get("protocol", "?"), 19)
        ver = d.get("version", "")
        chain = d.get("chain", ", ".join(d.get("chains", [])[:1]))
        vol = format_number(d.get("total24h", 0))
        factory = format_address(d.get("factory", ""))
        print(f"{name:<20} {ver:<8} {chain:<12} {vol:>14} {factory}")
    print(f"\n{dim(f'Total: {len(protocols)} DEXs')}")

# ── Command: dex ──────────────────────────────────────────────────────────────
def cmd_dex(args):
    """Show DEX details."""
    name = args.name.lower()
    chain_filter = args.chain.lower() if args.chain else None

    if args.api or not DEXS_FILE.exists():
        data = api_get("/overview/dexs")
        protocols = data.get("protocols", []) if isinstance(data, dict) else []
    else:
        protocols = load_json(DEXS_FILE, [])

    matches = [d for d in protocols if name in d.get("protocol", "").lower()]
    if chain_filter:
        matches = [d for d in matches if chain_filter in [c.lower() for c in d.get("chains", [])]]

    if not matches:
        print(red(f"DEX '{name}' not found."))
        return

    if args.json:
        print(json.dumps(matches, indent=2))
        return

    for d in matches[:10]:
        print(bold(f"\n=== {d.get('protocol', '?')} {d.get('version', '')} ==="))
        print(f"  Chains: {', '.join(d.get('chains', []))}")
        print(f"  24h Volume: {format_number(d.get('total24h', 0))}")
        print(f"  7d Volume: {format_number(d.get('total7d', 0))}")
        if d.get("factory"):
            print(f"  Factory: {d['factory']}")
        if d.get("router"):
            print(f"  Router: {d['router']}")

# ── Command: bridges ──────────────────────────────────────────────────────────
def cmd_bridges(args):
    """List bridges."""
    if args.api or not BRIDGES_FILE.exists():
        data = api_get("/bridges")
        if isinstance(data, dict):
            bridges = data.get("bridges", [])
        else:
            bridges = data if isinstance(data, list) else []
    else:
        bridges = load_json(BRIDGES_FILE, [])

    bridges.sort(key=lambda b: b.get("lastDailyVolume", 0) or 0, reverse=True)

    if args.json:
        print(json.dumps(bridges, indent=2))
        return

    print(bold(f"\n{'Bridge':<25} {'24h Vol':>14} {'Chains'}"))
    print("─" * 60)
    for b in bridges[:30]:
        name = truncate(b.get("name", "?"), 24)
        vol = format_number(b.get("lastDailyVolume", 0))
        chains = ", ".join(b.get("destinationChain", [])[:3])
        print(f"{name:<25} {vol:>14} {chains}")
    print(f"\n{dim(f'Total: {len(bridges)} bridges')}")

# ── Command: yields ───────────────────────────────────────────────────────────
def cmd_yields(args):
    """List yield opportunities."""
    if args.api or not YIELDS_FILE.exists():
        data = api_get("/pools")
        if isinstance(data, dict):
            pools = data.get("data", [])
        else:
            pools = []
    else:
        pools = load_json(YIELDS_FILE, [])

    if args.chain:
        pools = [p for p in pools if match_search(p.get("chain", ""), args.chain)]

    # Sort by APY
    pools.sort(key=lambda p: p.get("apy", 0) or 0, reverse=True)

    if args.top:
        pools = pools[:args.top]

    if args.json:
        print(json.dumps(pools, indent=2))
        return

    print(bold(f"\n{'Pool':<30} {'Chain':<12} {'APY':>8} {'TVL':>14}"))
    print("─" * 66)
    for p in pools[:30]:
        name = truncate(p.get("pool", "?"), 29)
        chain = p.get("chain", "?")
        apy = f"{p.get('apy', 0):.2f}%" if p.get("apy") else "N/A"
        tvl = format_number(p.get("tvlUsd", 0))
        print(f"{name:<30} {chain:<12} {apy:>8} {tvl:>14}")

# ── Command: rpc ──────────────────────────────────────────────────────────────
def cmd_rpc(args):
    """Get RPC endpoints."""
    chain = args.chain.lower()

    if args.api or not RPCS_FILE.exists():
        data = api_get("/v2/chains")
        if isinstance(data, list):
            chain_data = next((c for c in data if c.get("name", "").lower() == chain), None)
            rpcs = chain_data.get("rpcs", []) if chain_data else []
        else:
            rpcs = []
    else:
        all_rpcs = load_json(RPCS_FILE, {})
        rpcs = all_rpcs.get(chain, {}).get("rpcs", [])

    if not rpcs:
        print(red(f"No RPCs found for '{chain}'."))
        return

    if args.json:
        print(json.dumps({"chain": chain, "rpcs": rpcs}, indent=2))
        return

    print(bold(f"\n=== {chain.upper()} RPCs ===\n"))
    for i, r in enumerate(rpcs, 1):
        print(f"  {i:3}. {r}")

# ── Command: assets ───────────────────────────────────────────────────────────
def cmd_assets(args):
    """Get core assets."""
    if args.api or not ASSETS_FILE.exists():
        data = api_get("/coins/ethereum")
        if isinstance(data, dict):
            assets = data.get("coins", {})
        else:
            assets = {}
    else:
        assets = load_json(ASSETS_FILE, {})

    if args.json:
        print(json.dumps(assets, indent=2))
        return

    print(bold(f"\n=== Core Assets ===\n"))
    for symbol, info in list(assets.items())[:30]:
        price = info.get("price", 0)
        print(f"  {symbol:<15} ${price:>12,.4f}")

# ── Command: quote ────────────────────────────────────────────────────────────
def cmd_quote(args):
    """Get swap quote."""
    chain = args.chain.lower()
    token_in = args.token_in
    token_out = args.token_out
    amount = args.amount

    if args.json:
        result = api_get("/swap", {"chain": chain, "from": token_in, "to": token_out, "amount": amount})
        print(json.dumps(result, indent=2))
        return

    data = api_get("/swap", {"chain": chain, "from": token_in, "to": token_out, "amount": amount})
    if isinstance(data, dict) and "error" in data:
        print(red(f"Quote error: {data['error']}"))
        return

    print(bold(f"\n=== Swap Quote ===\n"))
    print(f"  Chain: {chain}")
    print(f"  From: {token_in}")
    print(f"  To: {token_out}")
    print(f"  Amount: {amount}")
    print(f"  Output: {data.get('outputAmount', 'N/A')}")

# ── Command: search ───────────────────────────────────────────────────────────
def cmd_search(args):
    """Search everything."""
    query = args.query.lower()

    results = []

    # Search protocols
    protocols = load_json(PROTOCOLS_FILE, [])
    for p in protocols:
        if query in p.get("name", "").lower() or query in p.get("slug", "").lower():
            results.append({"type": "protocol", "name": p.get("name"), "tvl": p.get("tvl", 0)})

    # Search chains
    chains = load_json(CHAIN_TVL_FILE, [])
    for c in chains:
        if query in c.get("name", "").lower():
            results.append({"type": "chain", "name": c.get("name")})

    # Search DEXs
    dexs = load_json(DEXS_FILE, [])
    for d in dexs:
        if query in d.get("protocol", "").lower():
            results.append({"type": "dex", "name": d.get("protocol"), "version": d.get("version")})

    results.sort(key=lambda r: r.get("tvl", 0) or 0, reverse=True)

    if args.json:
        print(json.dumps(results[:20], indent=2))
        return

    print(bold(f"\n=== Search: '{args.query}' ===\n"))
    for r in results[:20]:
        kind = r["type"].capitalize()
        name = r["name"]
        extra = ""
        if r.get("tvl"):
            extra = f" (TVL: {format_number(r['tvl'])})"
        elif r.get("version"):
            extra = f" v{r['version']}"
        print(f"  [{kind}] {name}{extra}")

# ── Command: stats ────────────────────────────────────────────────────────────
def cmd_stats(args):
    """Show aggregate statistics."""
    unified = load_json(UNIFIED_FILE, {})

    if not unified:
        print(yellow("No unified data. Run pipeline first."))
        return

    stats = {
        "chains": len(load_json(CHAIN_TVL_FILE, [])),
        "protocols": len(load_json(PROTOCOLS_FILE, [])),
        "dex_factory_protocols": len(load_json(DEXS_FILE, [])),
        "bridge_adapters": len(load_json(BRIDGES_FILE, [])),
        "yield_adaptors": len(load_json(YIELDS_FILE, [])),
        "rpc_chains": len(load_json(RPCS_FILE, {})),
        "core_asset_chains": len(load_json(ASSETS_FILE, {})),
        "registries": REGISTRIES,
    }

    if args.json:
        print(json.dumps(stats, indent=2))
        return

    print(bold("\n=== DefiLlama Data Stats ===\n"))
    print(f"  Chains:              {stats['chains']}")
    print(f"  Protocols:           {stats['protocols']}")
    print(f"  DEX protocols:       {stats['dex_factory_protocols']}")
    print(f"  Bridge adapters:     {stats['bridge_adapters']}")
    print(f"  Yield adaptors:      {stats['yield_adaptors']}")
    print(f"  Chains w/ RPCs:      {stats['rpc_chains']}")
    print(f"  Chains w/ assets:    {stats['core_asset_chains']}")
    print(f"  Registries:          {len(stats['registries'])}")

# ── Command: registry ─────────────────────────────────────────────────────────
def cmd_registry(args):
    """Show registry data."""
    if not REGISTRY_DIR.exists():
        print(yellow("No registry data available."))
        return

    registries = {}
    for reg_file in REGISTRY_DIR.glob("*.json"):
        name = reg_file.stem
        data = load_json(reg_file, [])
        registries[name] = len(data) if isinstance(data, list) else 0

    if args.json:
        print(json.dumps(registries, indent=2))
        return

    print(bold("\n=== Adapter Registries ===\n"))
    for name, count in sorted(registries.items()):
        print(f"  {name:<25} {count:>6} entries")

# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(
        description="Comprehensive CLI for interacting with the DefiLlama ecosystem",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  defillama-cli chains --top 20 --sort dex
  defillama-cli chain base --rpcs --dexs --assets
  defillama-cli protocols --chain ethereum --top 10
  defillama-cli dexs --chain base --search aero
  defillama-cli rpc ethereum --verify
  defillama-cli search uniswap
  defillama-cli yields --chain base --min-apy 5 --top 10
  defillama-cli quote base 0x...WETH 0x...USDC --amount 1000000000000000000
        """,
    )
    parser.add_argument("--json", "-j", action="store_true", help="Output as JSON")
    parser.add_argument("--api", action="store_true", help="Force live API (skip local data)")
    parser.add_argument("--limit", "-l", type=int, help="Max results to show")

    sub = parser.add_subparsers(dest="command", help="Command to run")

    # chains
    p_chains = sub.add_parser("chains", help="List/search chains")
    p_chains.add_argument("--search", "-s", help="Search chain name")
    p_chains.add_argument("--top", "-t", type=int, help="Top N chains")
    p_chains.add_argument("--sort", choices=["name", "dex", "rpc", "bridge"], default="name")

    # chain
    p_chain = sub.add_parser("chain", help="Chain details")
    p_chain.add_argument("name", help="Chain name")
    p_chain.add_argument("--rpcs", action="store_true")
    p_chain.add_argument("--dexs", action="store_true")
    p_chain.add_argument("--assets", action="store_true")
    p_chain.add_argument("--all", "-a", action="store_true")

    # protocols
    p_protocols = sub.add_parser("protocols", help="List/search protocols")
    p_protocols.add_argument("--chain", "-c", help="Filter by chain")
    p_protocols.add_argument("--category", help="Filter by category")
    p_protocols.add_argument("--search", "-s", help="Search by name")
    p_protocols.add_argument("--top", "-t", type=int, help="Top N protocols")

    # protocol
    p_protocol = sub.add_parser("protocol", help="Protocol details")
    p_protocol.add_argument("name", help="Protocol name/slug")

    # dexs
    p_dexs = sub.add_parser("dexs", help="List DEXs")
    p_dexs.add_argument("--chain", "-c", help="Filter by chain")
    p_dexs.add_argument("--search", "-s", help="Search by name")

    # dex
    p_dex = sub.add_parser("dex", help="DEX details")
    p_dex.add_argument("name", help="DEX name")
    p_dex.add_argument("--chain", "-c", help="Filter by chain")

    # bridges
    sub.add_parser("bridges", help="List bridges")

    # yields
    p_yields = sub.add_parser("yields", help="List yield opportunities")
    p_yields.add_argument("--chain", "-c", help="Filter by chain")
    p_yields.add_argument("--min-apy", type=float, help="Min APY %%")
    p_yields.add_argument("--top", "-t", type=int, help="Top N yields")

    # rpc
    p_rpc = sub.add_parser("rpc", help="Get RPC endpoints")
    p_rpc.add_argument("chain", help="Chain name")
    p_rpc.add_argument("--verify", action="store_true", help="Verify RPCs are alive")

    # assets
    sub.add_parser("assets", help="Get core assets")

    # quote
    p_quote = sub.add_parser("quote", help="Get swap quote")
    p_quote.add_argument("chain", help="Chain name")
    p_quote.add_argument("token_in", help="Input token address")
    p_quote.add_argument("token_out", help="Output token address")
    p_quote.add_argument("amount", help="Amount in (wei)")

    # search
    p_search = sub.add_parser("search", help="Search everything")
    p_search.add_argument("query", help="Search query")

    # stats
    sub.add_parser("stats", help="Aggregate statistics")

    # registry
    sub.add_parser("registry", help="Show registry data")

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        return

    # Dispatch
    commands = {
        "chains": cmd_chains,
        "chain": cmd_chain,
        "protocols": cmd_protocols,
        "protocol": cmd_protocol,
        "dexs": cmd_dexs,
        "dex": cmd_dex,
        "bridges": cmd_bridges,
        "yields": cmd_yields,
        "rpc": cmd_rpc,
        "assets": cmd_assets,
        "quote": cmd_quote,
        "search": cmd_search,
        "stats": cmd_stats,
        "registry": cmd_registry,
    }

    commands[args.command](args)

if __name__ == "__main__":
    main()
