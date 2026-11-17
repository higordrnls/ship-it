# HD Web Engine v0.2

Dependency-free static landing page generator for Node.js 20+. No client data, hosting or deployment included.

```sh
cd hd-studio/web-engine
node --test
node build.mjs examples/furniture.json dist
node build.mjs examples/architecture.json dist-architecture
```

Open the generated index.html in a browser. Each output is a standalone HTML page plus optional local assets. The generator refuses existing output directories to avoid overwriting work. Use a new directory for each build. Keep real client configuration private.

The two fictional examples demonstrate distinct palettes, typography and hero compositions. Preview pages are labeled and noindexed; a production configuration requires explicit approval and a verified phone. This is a small MVP, not a CMS or a deployment tool. Confirm image rights and business claims before building, and audit rendered layouts and links before release. Configuration supports optional local portfolio images (relative to the JSON file; copied on build). No external tracking or fonts.

Run tests and follow ../STANDARDS.md. Production approval in configuration records the operator's decision; it is not a substitute for actual client authorization.
