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

### Install necessary packages

#### Requirements method
```sh
pip freeze > src/requirements.txt
pip install -r src/requirements.txt
```

#### Or manually

```sh
pip install python-frontmatter
```

Install weasyprint:
```sh
pip install weasyprint
```