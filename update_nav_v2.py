import os
import re

files = [
    "contacto.html",
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

# The CORRECT Desktop Nav Block
new_nav = """    <nav class="fixed top-3 md:top-6 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-6xl">
        <div class="glass-nav rounded-xl md:rounded-2xl px-4 md:px-8 py-3 md:py-4 flex items-center justify-between">

            <div class="flex items-center">
                <a href="index.html">
                    <img src="https://i.postimg.cc/MKncLryk/habitantelogo2.png" alt="Habitante Logo"
                        class="h-8 md:h-10 w-auto" />
                </a>
            </div>

            <!-- Desktop Menu -->
            <div class="hidden lg:flex items-center gap-8">
                <a class="text-sm font-medium hover:text-[var(--primary)] transition-colors"
                    href="index.html">Inicio</a>

                <!-- Quiénes Somos Dropdown -->
                <div class="relative group">
                    <button
                        class="text-sm font-medium hover:text-[var(--primary)] transition-colors flex items-center gap-1">
                        Quiénes Somos
                        <span class="material-symbols-outlined text-xs">expand_more</span>
                    </button>
                    <div
                        class="absolute top-full left-0 mt-2 w-56 glass-nav rounded-2xl border border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 shadow-2xl">
                        <a href="quienes-somos.html"
                            class="block px-6 py-3 text-sm hover:text-[var(--primary)] transition-colors border-b border-white/5">Quiénes
                            Somos</a>
                        <a href="sociedades.html"
                            class="block px-6 py-3 text-sm hover:text-[var(--primary)] transition-colors">Sociedades del
                            Grupo</a>
                    </div>
                </div>

                <!-- Proyectos Dropdown -->
                <div class="relative group">
                    <button
                        class="text-sm font-medium hover:text-[var(--primary)] transition-colors flex items-center gap-1">
                        Proyectos
                        <span class="material-symbols-outlined text-xs">expand_more</span>
                    </button>
                    <div
                        class="absolute top-full left-0 mt-2 w-56 glass-nav rounded-2xl border border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 shadow-2xl">
                        <a href="marketplace.html"
                            class="block px-6 py-3 text-sm hover:text-[var(--primary)] transition-colors border-b border-white/5">Promociones
                            en Curso</a>
                        <a href="proyectos-estudio.html"
                            class="block px-6 py-3 text-sm hover:text-[var(--primary)] transition-colors">Proyectos en
                            Estudio</a>
                    </div>
                </div>

                <!-- Inversión Dropdown -->
                <div class="relative group">
                    <button
                        class="text-sm font-medium hover:text-[var(--primary)] transition-colors flex items-center gap-1">
                        Inversión
                        <span class="material-symbols-outlined text-xs">expand_more</span>
                    </button>
                    <div
                        class="absolute top-full left-0 mt-2 w-56 glass-nav rounded-2xl border border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 shadow-2xl">
                        <a href="inversores.html"
                            class="block px-6 py-3 text-sm hover:text-[var(--primary)] transition-colors border-b border-white/5">Crowdfunding</a>
                        <a href="iniciativas.html"
                            class="block px-6 py-3 text-sm hover:text-[var(--primary)] transition-colors">Iniciativas</a>
                    </div>
                </div>

                <!-- Plataforma Habitante Dropdown -->
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
                </div>
            </div>

            <div class="flex items-center gap-4 lg:gap-8">
                <button id="mobile-menu-btn" class="lg:hidden text-white p-2">
                    <span class="material-symbols-outlined">menu</span>
                </button>
            </div>
        </div>
    </nav>"""

# The CORRECT Mobile Menu Block
new_mobile = """    <!-- Mobile Menu Overlay -->
    <div id="mobile-menu" class="fixed inset-0 z-[200] hidden">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" onclick="closeMobileMenu()"></div>

        <!-- Menu Panel -->
        <div
            class="absolute right-0 top-0 h-full w-[85%] max-w-sm glass-nav border-l border-white/10 shadow-2xl transform translate-x-0">
            <div class="flex flex-col h-full">
                <!-- Header -->
                <div class="flex items-center justify-between p-6 border-b border-white/10">
                    <img src="https://i.postimg.cc/MKncLryk/habitantelogo2.png" alt="Habitante" class="h-8">
                    <button onclick="closeMobileMenu()" class="text-white p-2">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>

                <!-- Menu Items -->
                <div class="flex-1 overflow-y-auto p-6 space-y-2">
                    <a href="index.html"
                        class="block py-3 text-sm font-medium hover:text-[var(--primary)] border-b border-white/5">
                        Inicio
                    </a>

                    <!-- Quiénes Somos Mobile Dropdown -->
                    <div class="border-b border-white/5">
                        <button onclick="toggleMobileDropdown('quienes')"
                            class="w-full flex items-center justify-between py-3 text-sm font-medium">
                            <span>Quiénes Somos</span>
                            <span id="quienes-icon"
                                class="material-symbols-outlined text-sm transition-transform">expand_more</span>
                        </button>
                        <div id="quienes-dropdown" class="hidden pl-4 pb-2 space-y-2">
                            <a href="quienes-somos.html"
                                class="block py-2 text-sm text-slate-400 hover:text-[var(--primary)]">Quiénes Somos</a>
                            <a href="sociedades.html"
                                class="block py-2 text-sm text-slate-400 hover:text-[var(--primary)]">Sociedades del
                                Grupo</a>
                        </div>
                    </div>

                    <!-- Proyectos Mobile Dropdown -->
                    <div class="border-b border-white/5">
                        <button onclick="toggleMobileDropdown('proyectos')"
                            class="w-full flex items-center justify-between py-3 text-sm font-medium">
                            <span>Proyectos</span>
                            <span id="proyectos-icon"
                                class="material-symbols-outlined text-sm transition-transform">expand_more</span>
                        </button>
                        <div id="proyectos-dropdown" class="hidden pl-4 pb-2 space-y-2">
                            <a href="marketplace.html"
                                class="block py-2 text-sm text-slate-400 hover:text-[var(--primary)]">Promociones en
                                Curso</a>
                            <a href="proyectos-estudio.html"
                                class="block py-2 text-sm text-slate-400 hover:text-[var(--primary)]">Proyectos en
                                Estudio</a>
                        </div>
                    </div>

                    <!-- Inversión Mobile Dropdown -->
                    <div class="border-b border-white/5">
                        <button onclick="toggleMobileDropdown('inversion')"
                            class="w-full flex items-center justify-between py-3 text-sm font-medium">
                            <span>Inversión</span>
                            <span id="inversion-icon"
                                class="material-symbols-outlined text-sm transition-transform">expand_more</span>
                        </button>
                        <div id="inversion-dropdown" class="hidden pl-4 pb-2 space-y-2">
                            <a href="inversores.html"
                                class="block py-2 text-sm text-slate-400 hover:text-[var(--primary)]">Crowdfunding</a>
                            <a href="iniciativas.html"
                                class="block py-2 text-sm text-slate-400 hover:text-[var(--primary)]">Iniciativas</a>
                        </div>
                    </div>

                    <!-- Plataforma Habitante Mobile Dropdown -->
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
                    </div>
                </div>
            </div>
        </div>
    </div>"""

for filename in files:
    full_path = os.path.join(base_path, filename)
    if not os.path.exists(full_path):
        continue
    
    with open(full_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace the entire <nav> block
    # Matches from <nav ...> to </nav>
    content = re.sub(
        r'<nav.*?</nav>',
        new_nav,
        content,
        flags=re.DOTALL
    )

    # Replace the entire mobile menu block
    # Matches from <!-- Mobile Menu Overlay --> or <div id="mobile-menu" ...> to the closing </div> of that menu
    # Using a more robust pattern for the mobile menu
    content = re.sub(
        r'(<!--\s*Mobile Menu Overlay\s*-->\s*)?<div id="mobile-menu".*?</div>\s*</div>\s*</div>\s*</div>',
        new_mobile,
        content,
        flags=re.DOTALL
    )

    with open(full_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Nav blocks replaced in all files.")
