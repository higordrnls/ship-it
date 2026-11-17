# Browser editor v0.3 (experimental)

From this directory run `python3 -m http.server 8000 --bind 127.0.0.1` and open http://127.0.0.1:8000/editor.html. Serve locally; the editor uses ES modules and is not hosted by this PR.

Edit company name, copy, services, palette, typography, layout and contact. Click update preview, then export HTML or JSON. Uses the existing engine renderer, not a separate template. Exports are always unofficial previews; production still requires the CLI approval gate. No network calls are made by the editor; the generated HTML may include a verified WhatsApp link. The editor does not send messages. No persistence or photo uploader yet. Do not commit client JSON to a public repository.

Manual acceptance checks (not executed yet): open both examples, change headline and palette, verify preview updates, reject invalid contrast and malformed services, verify changing the phone clears verification, export and open HTML, export JSON and build via CLI, inspect at mobile and desktop widths. Check keyboard navigation and browser console. Existing engine tests must be rerun before merge.
