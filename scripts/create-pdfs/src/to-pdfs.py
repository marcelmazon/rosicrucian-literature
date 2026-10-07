# ------------------------------------------------------------------
# This script converts a single .md to .pdf for testing and
# quick editing of styles
# ------------------------------------------------------------------
# This script must be called from the scripts/ directory
# in order to work, otherwise file paths will be messed up
# ------------------------------------------------------------------
# Uses 4 threads for more efficiency because I have 4 CPU cores
# ------------------------------------------------------------------

from pathlib import Path
import markdown
import frontmatter
from weasyprint import HTML, CSS
import re
from multiprocessing import Pool

def convert_markdown_to_pdf(md_path, pdf_path):
	# This regex finds nested headers like <h4><h4 id="... ">Text</h4></h4> 
	# and collapses them into a single <h4> tag. This function is necessary
	# because the markdown headers are formatted with both "#" and <h3>
	# headers, so when converting markdown to html it ends up wrapping an
	# <h3> within an <h3>, for example, which affects CSS formatting.
	def clean_nested_headers(html_string):
		# pattern: <hN><hN id="... ">Text</hN></hN>
		# Group 1: The header level (e.g., h3)
		# Group 2: The id content
		# Group 3: The actual text content
		pattern = r'<(h[1-6])>\s*<(h[1-6]) id="(.*?)">(.*?)</\2>\s*</\1>'
		# We replace the whole mess with a single clean tag
		replacement = r'<\1 id="\3">\4</\1>'
		# Correct order: pattern, replacement, then the actual string
		return re.sub(pattern, replacement, html_string, flags=re.DOTALL)

	# 1. Read the Markdown file
	with open(str(md_path), "r", encoding="utf-8") as f:
		post = frontmatter.load(f)

	# Get Markdown file's base url (need for later)
	current_dir = md_path.parent.absolute()

	# Access metadata (e.g., post['title']) and content separately
	metadata = post.metadata
	content_html = markdown.markdown(post.content, extensions=['extra'])
	# Clean resulting html from nested headers e.g. <hN><hN>Header<hN/><hN/>
	clean_html = clean_nested_headers(content_html)

	# 2. Convert Markdown text to HTML text
	# 'extra' adds support for tables, footnotes, etc.
	html_text = markdown.markdown(clean_html, extensions=['extra'])

	# 2. Define the "Classic Book" CSS
	# WeasyPrint supports @page rules for print-specific styling
	with open("src/book.css", "r", encoding="utf-8") as f:
		book_style = f.read()

	# Assuming pdf_path is a Path object or a string
	target_pdf = Path(str(pdf_path).replace(".md", ".pdf"))
	target_pdf.parent.mkdir(parents=True, exist_ok=True)

	# 4. Generate the PDF with the CSS applied
	HTML(string=clean_html, base_url=str(current_dir)).write_pdf(
		str(target_pdf), 
		stylesheets=[CSS(string=book_style)]
	)

# START MAIN PROGRAM

langs = [
	# Romance
	"es", "pt", "fr", "it", "ro",
	# Germanic
	"en", "de", "nl", "sv",
	# Slavic
	"ru", "uk", "pl", "bg",
	# Sinitic
	"zh",
	# Turkic
	"tr",
	# Finno-Ugric
	"fi"
]

# Make root directory to store pdfs
Path("../pdfs").mkdir(parents=True, exist_ok=True)

for i, lang in enumerate(langs):
    langs[i] = Path("../" + lang)

md_and_pdf_paths = []

for lang in langs:
	path = Path(lang)
	files = (
		f for f in path.rglob('*.md') 
		if f.name.lower() != 'readme.md'
	)
	for entry in files:
		# pdf_path needed to print pdf
		md_path = entry
		pdf_path = Path(str(entry).replace("../", "../pdfs/"))
		md_and_pdf_path = (md_path, pdf_path)
		md_and_pdf_paths.append((md_path, pdf_path))
		
		# Uncomment for single-threaded version
		# convert_markdown_to_pdf(md_and_pdf_paths)

with Pool(4) as p:
	p.starmap(convert_markdown_to_pdf, md_and_pdf_paths)

# END MAIN PROGRAM