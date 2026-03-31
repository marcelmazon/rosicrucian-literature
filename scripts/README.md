# Scripts

## Bun notes

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.3.9. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.

## Python Notes

```
Consider using Playwright in the future instead of 
Weasyprint to have a unified JS ecosystem for scripts. 
Playwright .pdfs are apparently heavier, but support 
more CSS features and also JS ones.
```

Create environment:

```sh
python3 -m venv .venv 
```

Activate environment:

```sh
source .venv/bin/activate
```

Deactivate environment:

```sh
deactivate
```

Install weasyprint:

```sh
pip install weasyprint
```