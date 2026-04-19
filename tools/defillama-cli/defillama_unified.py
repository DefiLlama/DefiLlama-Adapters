#!/usr/bin/env python3
"""
DefiLlama Unified Data Pipeline
Extracts and normalizes data from DefiLlama's GitHub repos and APIs into
a unified local JSON dataset for offline CLI usage.
"""

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
REGISTRY_DIR = SCRIPT_DIR / "registry_data"

# ── GitHub repos to extract from ──────────────────────────────────────────────
REPOS = {
    "dimension-adapters": "https://github.com/DefiLlama/dimension-adapters.git",
    "DefiLlama-Adapters": "https://github.com/DefiLlama/DefiLlama-Adapters.git",
}

# ── Adapter registries ────────────────────────────────────────────────────────
REGISTRIES = [
    "aave", "aaveV3", "balancer", "compound", "erc4626", "gmx",
    "masterchef", "solanaStakePool", "stakingOnly", "uniswapV2",
    "uniswapV3", "uniswapV3Graph",
]

# ── Helpers ────────────────────────────────────────────────────────────────────
def run(cmd, cwd=None):
    """Run shell command, return stdout."""
    try:
        r = subprocess.run(cmd, shell=True, capture_output=True, text=True, cwd=cwd, timeout=120)
        return r.stdout.strip()
    except subprocess.TimeoutExpired:
        return ""

def save_json(path, data):
    """Save JSON file."""
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w") as f:
        json.dump(data, f, indent=2, default=str)

def load_json(path, default=None):
    """Load JSON file."""
    try:
        with open(path) as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return default if default is not None else {}

# ── Phase 1: Clone/update repos ──────────────────────────────────────────────
def clone_repos():
    """Clone or update DefiLlama repos."""
    repos_dir = SCRIPT_DIR / "repos"
    repos_dir.mkdir(exist_ok=True)

    for name, url in REPOS.items():
        repo_path = repos_dir / name
        if repo_path.exists():
            print(f"  Updating {name}...")
            run(f"git pull", cwd=repo_path)
        else:
            print(f"  Cloning {name}...")
            run(f"git clone --depth 1 {url} {repo_path}")

    return repos_dir

# ── Phase 2: Extract DEX factory addresses ───────────────────────────────────
def extract_dex_data(repos_dir):
    """Extract DEX factory/router addresses from dimension-adapters."""
    dim_dir = repos_dir / "dimension-adapters"
    dexs = []

    # Look for DEX adapter files
    for f in dim_dir.rglob("*.js"):
        if "dex" in str(f).lower() or "swap" in str(f).lower():
            content = f.read_text(errors="ignore")
            # Extract factory addresses
            factories = re.findall(r'0x[a-fA-F0-9]{40}', content)
            if factories:
                chain = f.parent.name.lower()
                protocol = f.stem
                for addr in set(factories):
                    dexs.append({
                        "protocol": protocol,
                        "chain": chain,
                        "factory": addr,
                        "source": "dimension-adapters",
                    })

    # Deduplicate
    seen = set()
    unique = []
    for d in dexs:
        key = (d["protocol"], d["chain"], d["factory"])
        if key not in seen:
            seen.add(key)
            unique.append(d)

    return unique

# ── Phase 3: Extract registry data ────────────────────────────────────────────
def extract_registries(repos_dir):
    """Extract adapter registry data."""
    adapters_dir = repos_dir / "DefiLlama-Adapters" / "projects"
    registries = {}

    for reg in REGISTRIES:
        reg_file = adapters_dir / f"{reg}.js"
        if reg_file.exists():
            content = reg_file.read_text(errors="ignore")
            # Extract addresses
            addresses = re.findall(r'0x[a-fA-F0-9]{40}', content)
            registries[reg] = list(set(addresses))
        else:
            registries[reg] = []

    return registries

# ── Phase 4: Fetch live data ──────────────────────────────────────────────────
import urllib.request
import ssl

API_BASE = "https://api.llama.fi"

def api_get(endpoint):
    """Fetch from DefiLlama API."""
    url = f"{API_BASE}{endpoint}"
    ctx = ssl.create_default_context()
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "defillama-cli/1.0"})
        with urllib.request.urlopen(req, context=ctx, timeout=30) as resp:
            return json.loads(resp.read().decode())
    except Exception as e:
        return {"error": str(e)}

def fetch_live_data():
    """Fetch live chain, protocol, DEX data."""
    print("  Fetching chains...")
    chains = api_get("/v2/chains")
    if isinstance(chains, list):
        save_json(DATA_DIR / "chain_tvl.json", chains)

    print("  Fetching protocols...")
    protocols = api_get("/protocols")
    if isinstance(protocols, list):
        save_json(DATA_DIR / "protocols.json", protocols)

    print("  Fetching DEXs...")
    dexs = api_get("/overview/dexs")
    if isinstance(dexs, dict):
        save_json(DATA_DIR / "dexs.json", dexs.get("protocols", []))

    print("  Fetching bridges...")
    bridges = api_get("/bridges")
    if isinstance(bridges, dict):
        save_json(DATA_DIR / "bridges.json", bridges.get("bridges", []))

    print("  Fetching yields...")
    yields = api_get("/pools")
    if isinstance(yields, dict):
        save_json(DATA_DIR / "yields.json", yields.get("data", []))

    return {
        "chains": len(chains) if isinstance(chains, list) else 0,
        "protocols": len(protocols) if isinstance(protocols, list) else 0,
        "dexs": len(dexs.get("protocols", [])) if isinstance(dexs, dict) else 0,
    }

# ── Phase 5: Build unified dataset ────────────────────────────────────────────
def build_unified(dexs, registries, live_stats):
    """Build unified dataset."""
    unified = {
        "generated_at": datetime.now().isoformat(),
        "sources": {
            "dimension-adapters": len(dexs),
            "registries": {k: len(v) for k, v in registries.items()},
            "live_api": live_stats,
        },
        "dex_factories": dexs,
        "registry_contracts": registries,
    }

    save_json(DATA_DIR / "unified_defillama.json", unified)
    return unified

# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    print("=== DefiLlama Unified Data Pipeline ===\n")

    print("[1/5] Cloning/updating repos...")
    repos_dir = clone_repos()

    print("\n[2/5] Extracting DEX data from dimension-adapters...")
    dexs = extract_dex_data(repos_dir)
    print(f"  Found {len(dexs)} DEX factory/router addresses")

    print("\n[3/5] Extracting adapter registries...")
    registries = extract_registries(repos_dir)
    total_reg = sum(len(v) for v in registries.values())
    print(f"  Found {total_reg} registry contracts across {len(registries)} registries")

    print("\n[4/5] Fetching live API data...")
    live_stats = fetch_live_data()

    print("\n[5/5] Building unified dataset...")
    unified = build_unified(dexs, registries, live_stats)

    print(f"\n=== Complete ===")
    print(f"  DEX factories: {len(dexs)}")
    print(f"  Registry contracts: {total_reg}")
    print(f"  Chains: {live_stats.get('chains', 0)}")
    print(f"  Protocols: {live_stats.get('protocols', 0)}")
    print(f"  Output: {DATA_DIR}")

if __name__ == "__main__":
    main()
