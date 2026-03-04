
import os
import re

# The complete footer and modals block from index.html (lines 627-843 approx)
# I will read it from the file to be sure I have the latest version.

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()
    # Find the footer start
    footer_match = re.search(r'<footer class="py-16 md:py-24 bg-surface border-t border-white/5">', content)
    if footer_match:
        # Get everything from footer start to </body>
        footer_block = content[footer_match.start():content.rfind('</body>')]
    else:
        print("Footer not found in index.html")
        exit(1)

html_files = [f for f in os.listdir('.') if f.endswith('.html')]

for file_name in html_files:
    if file_name == 'index.html':
        continue
        
    print(f"Processing {file_name}...")
    with open(file_name, 'r', encoding='utf-8') as f:
        content = f.read()

    # Step 1: Remove the specific text from plataforma.html (or any other)
    if file_name == 'plataforma.html':
        content = re.sub(r'<p class="mt-8 text-xs text-slate-600 uppercase tracking-widest font-bold font-editorial italic">\s*\* Lanzamiento total Q3 2026\. Acceso beta disponible para inversores\.</p>', '', content)
        # Also handle potential variations in spacing
        content = re.sub(r'\* Lanzamiento total Q3 2026\. Acceso beta disponible para inversores\.', '', content)

    # Step 2: Replace footer
    # Find the existing footer
    existing_footer_match = re.search(r'<footer.*?>.*?</footer>', content, re.DOTALL)
    if existing_footer_match:
        # Find all trailing content after the footer (like modals or just whitespace)
        # and replace it with the new footer block
        new_content = content[:existing_footer_match.start()] + footer_block + "\n</body>\n</html>"
        
        # Check if there was multiple footers or weird nesting
        # Actually, let's just replace from the first <footer to the end of the file (before </html>)
        new_content = re.sub(r'<footer.*', footer_block + "\n</body>\n</html>", content, flags=re.DOTALL)
        
        with open(file_name, 'w', encoding='utf-8') as f:
            f.write(new_content)
    else:
        print(f"No footer found in {file_name}, skipping replacement but check manually if needed.")

print("Done!")
