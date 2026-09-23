
# Picture of the Day

A minimal GNOME Shell extension that sets your desktop background to the
Wikimedia *Picture of the Day*.

On enable, the extension fetches the featured image from the Wikimedia REST API
and applies it to both the light and dark desktop backgrounds. The image is
cached on disk, so the network is only used once per day.

## Requirements

- GNOME Shell 45 – 49
- GJS with `libsoup` 3.0 (shipped with GNOME 45+)
- An active network connection

No additional settings schema or dependencies are required.

## Compatibility

| GNOME Shell  | Supported |
|--------------|-----------|
| 45 – 49      | Yes       |
| 44 and older | No        |

The extension uses ECMAScript modules and the post-45 `Extension` API, so it
cannot run on GNOME Shell 44 or earlier.

## Installation

### From a release bundle

Install and enable a prebuilt bundle (for example
`potd@suguiura.dev.shell-extension.zip`):

```sh
gnome-extensions install potd@suguiura.dev.shell-extension.zip
gnome-extensions enable potd@suguiura.dev
```

Add `--force` to overwrite an already installed copy when reinstalling.

### From source

Copy the extension into your user extension directory:

```sh
cp -r potd@suguiura.dev ~/.local/share/gnome-shell/extensions/
```

Then enable it:

```sh
gnome-extensions enable potd@suguiura.dev
```

If the extension does not appear, log out and back in so GNOME Shell rescans
the extension directory.

## Packaging

Create a distributable bundle from the project directory:

```sh
gnome-extensions pack . --extra-source=potd
```

This writes `potd@suguiura.dev.shell-extension.zip` next to the sources. Use
`-o`/`--out-dir` to write it somewhere else:

```sh
gnome-extensions pack . --extra-source=potd -o /tmp
```

Add `--force` (or `-f`) to overwrite an existing bundle.

`gnome-extensions pack` only bundles the standard top-level files
(`metadata.json`, `extension.js`, `stylesheet.css`, `prefs.js`). Any
subdirectory, such as `potd/`, must be passed explicitly with `--extra-source`;
otherwise the bundle is missing those modules and the extension fails to load.

## Usage

Enabling the extension is all that is required. It runs immediately and sets
the current day's image as your background.

Each day is cached as a separate file, so re-enabling the extension on the same
day reuses the downloaded image instead of fetching it again. The background is
not refreshed automatically while the session is running; it updates on the
next enable (for example, after a login or a `gnome-extensions enable`).

## How it works

1. `extension.js` builds the current date and computes a cache filename of the
   form `YYYY-MM-DD-wikimedia.image`.
2. If the file already exists, the download is skipped.
3. Otherwise, `potd/downloader.js` requests
   `https://api.wikimedia.org/feed/v1/wikipedia/en/featured/YYYY/MM/DD` and
   then downloads the image URL found in the response.
4. `potd/filesystem.js` writes the bytes to
   `$XDG_DATA_HOME/dev.suguiura.potd/` (defaulting to
   `~/.local/share/dev.suguiura.potd/`), creating the directory if
   needed.
5. `potd/settings.js` sets the `picture-uri` and `picture-uri-dark` keys of the
   `org.gnome.desktop.background` schema to the cached file's URI.

## File layout

```
potd@suguiura.dev/
├── extension.js          # Entry point: lifecycle and daily orchestration
├── metadata.json         # Extension metadata (uuid, name, shell-version)
├── stylesheet.css        # (unused) extension stylesheet
└── potd/
    ├── downloader.js     # Wikimedia API + image fetch (libsoup 3)
    ├── filesystem.js     # Cache path, existence check, atomic write
    └── settings.js       # Desktop background GSettings writes
```

## Development

There is no build step; the JavaScript is loaded directly by GNOME Shell.

GNOME Shell imports each extension module once per session, so editing the
sources while the session is running has no effect until you log out and back
in. For iterative testing, a nested shell can be launched without disturbing
your session:

```sh
dbus-run-session -- gnome-shell --nested --wayland --no-x11
```

Watch the output for the `potd` log lines and any `JS ERROR` entries.

## License

GPL-2.0-or-later. See the SPDX headers in the source files.
