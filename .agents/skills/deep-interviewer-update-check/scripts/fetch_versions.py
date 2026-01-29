#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = ["requests"]
# ///
"""
Fetch current and latest versions for deep-interviewer dependencies.
Checks Node.js base image and npm packages.

Usage: uv run fetch_versions.py [repo_root]
"""

import json
import re
import subprocess
import sys
from pathlib import Path

import requests


def get_current_node_version(dockerfile_path: Path) -> str | None:
    """Extract Node.js version from Dockerfile."""
    content = dockerfile_path.read_text()
    # Match patterns like: FROM node:22-alpine or FROM node:22.5.0-alpine
    match = re.search(r'FROM node:(\d+)(?:\.[\d.]+)?-alpine', content)
    if match:
        return match.group(1)  # Return major version
    return None


def fetch_node_lts_versions() -> dict:
    """Fetch Node.js LTS version info."""
    try:
        # Get release schedule
        schedule_resp = requests.get(
            'https://raw.githubusercontent.com/nodejs/Release/main/schedule.json',
            timeout=10
        )
        schedule = schedule_resp.json()

        # Get actual latest versions
        index_resp = requests.get('https://nodejs.org/dist/index.json', timeout=10)
        versions = index_resp.json()

        # Find latest LTS versions (even numbers)
        lts_versions = {}
        for v in versions:
            if v.get('lts'):
                major = int(v['version'].split('.')[0].lstrip('v'))
                if major not in lts_versions:
                    lts_versions[major] = {
                        'version': v['version'],
                        'lts': v['lts'],
                        'date': v['date']
                    }
                    # Get schedule info
                    version_key = f'v{major}'
                    if version_key in schedule:
                        lts_versions[major]['schedule'] = schedule[version_key]

        return {
            'lts_versions': lts_versions,
            'current_lts': max(lts_versions.keys()),
            'schedule': schedule
        }
    except Exception as e:
        return {'error': str(e)}


def check_package_compatibility(package_name: str, node_version: int) -> dict:
    """Check if a package supports a given Node.js version."""
    try:
        resp = requests.get(f'https://registry.npmjs.org/{package_name}/latest', timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            engines = data.get('engines', {})
            node_req = engines.get('node', 'any')
            return {
                'package': package_name,
                'node_requirement': node_req,
                'likely_compatible': 'any' in node_req.lower() or str(node_version) in node_req or '>=' in node_req
            }
    except Exception:
        pass
    return {'package': package_name, 'node_requirement': 'unknown', 'likely_compatible': True}


def run_pnpm_outdated(repo_root: Path) -> dict:
    """Run pnpm outdated to check for package updates."""
    result = subprocess.run(
        ['pnpm', 'outdated', '--format', 'json'],
        cwd=repo_root,
        capture_output=True,
        text=True
    )

    # pnpm outdated returns exit code 1 if there are outdated packages
    if result.stdout:
        try:
            outdated = json.loads(result.stdout)

            # Categorize by update type
            categorized = {'patch': [], 'minor': [], 'major': []}

            for pkg_name, info in outdated.items():
                current = info.get('current', '').split('.')
                latest = info.get('latest', '').split('.')

                if len(current) >= 1 and len(latest) >= 1:
                    if current[0] != latest[0]:
                        category = 'major'
                    elif len(current) >= 2 and len(latest) >= 2 and current[1] != latest[1]:
                        category = 'minor'
                    else:
                        category = 'patch'

                    categorized[category].append({
                        'name': pkg_name,
                        'current': info.get('current'),
                        'latest': info.get('latest'),
                        'type': info.get('dependencyType', 'unknown')
                    })

            return {
                'total': len(outdated),
                'categorized': categorized,
                'raw': outdated
            }
        except json.JSONDecodeError:
            return {'error': 'Failed to parse pnpm output', 'raw': result.stdout}

    return {'total': 0, 'categorized': {'patch': [], 'minor': [], 'major': []}}


def check_critical_packages(repo_root: Path) -> list[str]:
    """Get list of critical packages that need compatibility checks for Node upgrades."""
    package_json = repo_root / 'package.json'
    if not package_json.exists():
        return []

    data = json.loads(package_json.read_text())
    deps = list(data.get('dependencies', {}).keys())

    # Focus on packages known to have native modules or Node version sensitivity
    critical = [
        'better-sqlite3',  # Native module
        '@langchain/core',  # Frequently updated
        'typescript',  # Compiler compatibility
    ]

    return [p for p in critical if p in deps or p in data.get('devDependencies', {})]


def main():
    script_dir = Path(__file__).parent
    repo_root = script_dir.parent.parent.parent.parent

    if len(sys.argv) > 1:
        repo_root = Path(sys.argv[1])

    dockerfile_path = repo_root / 'Dockerfile'
    package_json_path = repo_root / 'package.json'

    if not dockerfile_path.exists():
        print(json.dumps({'error': f'Dockerfile not found at {dockerfile_path}'}))
        sys.exit(1)

    if not package_json_path.exists():
        print(json.dumps({'error': f'package.json not found at {package_json_path}'}))
        sys.exit(1)

    # Get current Node version
    current_node = get_current_node_version(dockerfile_path)

    # Fetch Node.js LTS info
    node_info = fetch_node_lts_versions()

    # Determine Node.js update status
    node_update = {'available': False}
    if current_node and 'lts_versions' in node_info:
        current_major = int(current_node)
        lts_versions = node_info['lts_versions']

        # Check for patch updates within same major
        if current_major in lts_versions:
            latest_in_major = lts_versions[current_major]['version']
            node_update['current_major'] = current_major
            node_update['latest_in_major'] = latest_in_major

        # Check for new LTS major version
        latest_lts = node_info['current_lts']
        if latest_lts > current_major:
            node_update['available'] = True
            node_update['new_lts_available'] = latest_lts
            node_update['new_lts_info'] = lts_versions[latest_lts]

            # Check critical package compatibility
            critical_packages = check_critical_packages(repo_root)
            compatibility = []
            for pkg in critical_packages:
                compat = check_package_compatibility(pkg, latest_lts)
                compatibility.append(compat)
            node_update['package_compatibility'] = compatibility

    # Check npm packages
    packages_info = run_pnpm_outdated(repo_root)

    # Determine overall update availability
    has_package_updates = packages_info.get('total', 0) > 0
    has_node_update = node_update.get('available', False)

    output = {
        'repo_root': str(repo_root),
        'node': {
            'current': current_node,
            'lts_info': node_info,
            'update': node_update
        },
        'packages': packages_info,
        'summary': {
            'node_update_available': has_node_update,
            'package_updates_available': has_package_updates,
            'major_package_updates': len(packages_info.get('categorized', {}).get('major', [])),
            'minor_package_updates': len(packages_info.get('categorized', {}).get('minor', [])),
            'patch_package_updates': len(packages_info.get('categorized', {}).get('patch', []))
        }
    }

    print(json.dumps(output, indent=2, default=str))


if __name__ == '__main__':
    main()
