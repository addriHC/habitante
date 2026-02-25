import os
import re

files = [
    "contacto.html",
    #"index.html", # Already updated manually
    "iniciativas.html",
    "inversores.html",
    "marketplace.html",
    "plataforma.html",
    "proyecto-detalle.html",
    "proyectos-estudio.html",
    "quienes-somos.html",
    "recursos.html",
    "sociedades.html"
]

base_path = r"c:\Users\adrin\Downloads\habitante web"

desktop_dropdown_new = """                <!-- Plataforma Habitante Dropdown -->
                <div class="relative group">
                    <button
                        class="text-sm font-medium hover:text-[var(--primary)] transition-colors flex items-center gap-1">
                        Plataforma Habitante
                        <span class="material-symbols-outlined text-xs">expand_more</span>
                    </button>
                    <div
                        class="absolute top-full left-0 mt-2 w-56 glass-nav rounded-2xl border border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 shadow-2xl">
                        <a href="plataforma.html"
                            class="block px-6 py-3 text-sm hover:text-[var(--primary)] transition-colors border-b border-white/5">Acceso Clientes</a>
                        <a href="contacto.html"
                            class="block px-6 py-3 text-sm hover:text-[var(--primary)] transition-colors">Hazte Cliente</a>
                    </div>
                </div>"""

mobile_dropdown_new = """                    <!-- Plataforma Habitante Mobile Dropdown -->
                    <div class="border-b border-white/5">
                        <button onclick="toggleMobileDropdown('plataforma')"
                            class="w-full flex items-center justify-between py-3 text-sm font-medium">
                            <span>Plataforma Habitante</span>
                            <span id="plataforma-icon"
                                class="material-symbols-outlined text-sm transition-transform">expand_more</span>
                        </button>
                        <div id="plataforma-dropdown" class="hidden pl-4 pb-2 space-y-2">
                            <a href="plataforma.html"
                                class="block py-2 text-sm text-slate-400 hover:text-[var(--primary)]">Acceso Clientes</a>
                            <a href="contacto.html"
                                class="block py-2 text-sm text-slate-400 hover:text-[var(--primary)]">Hazte Cliente</a>
                        </div>
                    </div>"""

for filename in files:
    full_path = os.path.join(base_path, filename)
    if not os.path.exists(full_path):
        continue
    
    with open(full_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Desktop link
    # Using a very loose pattern to capture the <a> tag
    content = re.sub(
        r'<a [^>]*?href="plataforma.html"[^>]*?>\s*Plataforma Habitante\s*</a>',
        desktop_dropdown_new,
        content,
        flags=re.DOTALL
    )

    # 2. Desktop right section
    # Removing Acceso Clientes and Hazte Cliente
    # This pattern matches the specific sequence of links
    content = re.sub(
        r'<a href="plataforma.html"\s+class="hidden lg:block text-sm font-medium hover:text\[var\(--primary\)\] transition-colors">Acceso\s+Clientes</a>\s*<a href="contacto.html"\s+class="bg-\[var\(--primary\)\] text-black px-6 md:px-8 py-2.5 rounded-full text-xs md:text-sm font-bold tracking-tight hover:brightness-105 transition-all shadow-md">.*?Hazte Cliente.*?</a>',
        '',
        content,
        flags=re.DOTALL
    )

    # 3. Mobile menu links
    # Matches both links in succession
    content = re.sub(
        r'<a href="plataforma.html"\s+class="block py-3 text-sm font-medium hover:text\[var\(--primary\)\] border-b border-white/5">\s*Plataforma Habitante\s*</a>\s*<a href="plataforma.html"\s+class="block py-3 text-sm font-medium hover:text\[var\(--primary\)\] border-b border-white/5">.*?Acceso.*?Clientes.*?</a>',
        mobile_dropdown_new,
        content,
        flags=re.DOTALL
    )

    # 4. Mobile bottom button
    # Matches the div and the button inside
    content = re.sub(
        r'<div class="p-6 border-t border-white/10">\s*<a href="contacto.html"\s+class="block w-full bg-\[var\(--primary\)\] text-black text-center py-4 rounded-xl font-bold text-sm">.*?Hazte.*?Cliente.*?</a>\s*</div>',
        '',
        content,
        flags=re.DOTALL
    )

    with open(full_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Batch update complete.")
