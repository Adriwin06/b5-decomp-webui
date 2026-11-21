#!/bin/sh
# Deploys the gallery behind decomp.adriwin.fr/webui. On the server this is
# /usr/local/bin/b5-webui-deploy, the only command the b5webui deploy key may run
# (authorized_keys: restrict,command="/usr/local/bin/b5-webui-deploy" <key>).
#
# It reads a gzipped tarball of the gallery bundle (gallery/, dist/, docs/, CHANGELOG.md,
# THIRD_PARTY.md) on stdin, checks that it holds only plain files and folders under those
# names, unpacks it as a new release and points /var/www/b5-webui/current at it in a single
# rename, keeping the five newest releases. nginx serves /webui/ from current/. The client's
# command line may name the commit: "deploy <sha>".
set -euf
umask 022
base=/var/www/b5-webui
max_bytes=67108864

# shellcheck disable=SC2086 # split the client's words; globbing is off (set -f)
set -- ${SSH_ORIGINAL_COMMAND:-deploy}
[ "${1:-}" = deploy ] || { echo 'usage: deploy [commit]' >&2; exit 2; }
commit=$(printf '%s' "${2:-}" | tr -cd '0-9a-f' | cut -c1-12)
release="$(date -u +%Y%m%d%H%M%S)-${commit:-unknown}"

tmp=$(mktemp -d "$base/.incoming.XXXXXX")
trap 'rm -rf "$tmp"' EXIT
head -c $((max_bytes + 1)) > "$tmp/bundle.tgz"
[ "$(wc -c < "$tmp/bundle.tgz")" -le "$max_bytes" ] || { echo 'bundle too large' >&2; exit 1; }
listing=$(tar -tzvf "$tmp/bundle.tgz") || { echo 'not a gzipped tarball' >&2; exit 1; }
names=$(tar -tzf "$tmp/bundle.tgz")
if printf '%s\n' "$listing" | cut -c1 | grep -qv '^[-d]$'; then echo 'bundle holds links or special files' >&2; exit 1; fi
if printf '%s\n' "$names" | grep -Ev '^(gallery|dist|docs)(/|$)|^(CHANGELOG|THIRD_PARTY)\.md$' | grep -q .; then echo 'unexpected paths in bundle' >&2; exit 1; fi
if printf '%s\n' "$names" | grep -Eq '(^|/)\.\.(/|$)'; then echo 'unsafe paths in bundle' >&2; exit 1; fi
printf '%s\n' "$names" | grep -qx 'gallery/index.html' || { echo 'bundle has no gallery/index.html' >&2; exit 1; }

mkdir "$tmp/release"
tar -xzf "$tmp/bundle.tgz" -C "$tmp/release" --no-same-owner --no-same-permissions
printf '%s\n' "b5-decomp-webui ${commit:-unknown}, deployed $(date -u +%FT%TZ)" > "$tmp/release/DEPLOYED.txt"
mkdir -p "$base/releases"
mv "$tmp/release" "$base/releases/$release"
ln -sfn "releases/$release" "$base/.current.new"
mv -T "$base/.current.new" "$base/current"
# keep the five newest releases (the one just made is current)
set +f
ls -1dt "$base"/releases/*/ | tail -n +6 | xargs -r rm -rf
echo "deployed $release"
