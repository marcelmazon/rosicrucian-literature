# ------------------------------------------------------------------
# This script converts a single .md to .pdf for testing and
# quick editing of styles
# ------------------------------------------------------------------

# write file to filesystem
import markdown
import frontmatter
from weasyprint import HTML, CSS
from pathlib import Path
import re

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
with open("../bg/heindel-max/космогонията-на-розенкройцерите.md", "r", encoding="utf-8") as f:
    post = frontmatter.load(f)

# Get Markdown file's base url (need for later)
current_dir = Path("../bg/heindel-max/космогонията-на-розенкройцерите.md").parent.absolute()

# Access metadata (e.g., post['title']) and content separately
metadata = post.metadata
content_html = markdown.markdown(post.content, extensions=['extra'])
clean_html = clean_nested_headers(content_html)

# For testing resulting .html file
# with open("see.html", "w") as file:
#     file.write(clean_html)
	
# Convert Markdown text to HTML text
# 'extra' adds support for tables, footnotes, etc.
html_text = markdown.markdown(clean_html, extensions=['extra'])

# Define CSS
# WeasyPrint supports @page rules for print-specific styling
with open("src/book.css", "r", encoding="utf-8") as f:
	book_style = f.read()

# Generate the PDF with the CSS applied
HTML(string=clean_html, base_url=str(current_dir)).write_pdf(
    "../pdfs/classic_book.pdf", 
    stylesheets=[CSS(string=book_style)]
)