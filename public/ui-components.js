/**
 * Habitante UI Component Library
 * Centralized component creation to ensure visual consistency across all pages.
 */

const UI = {
    /**
     * Creates a standardized Promotion Card
     * @param {Object} promo - The promotion data from Supabase
     * @param {string} type - 'marketplace', 'home', or 'estudio'
     */
    createCard: function (promo, type = 'marketplace') {
        const div = document.createElement('div');

        // Base classes
        div.className = 'group relative bg-white/5 border border-white/10 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:border-[#76e474]/50 hover:-translate-y-2';

        if (type === 'estudio' || type === 'marketplace-wide') {
            div.className = 'group bg-[#0A0A0A] rounded-[3rem] border border-white/5 overflow-hidden transition-all duration-500 hover:border-[#76e474]/50 hover:-translate-y-2';
        }

        const imageUrl = promo.main_image_url || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1000';

        // Status formatting
        let statusLabel = (promo.status === 'published' ? 'Publicado' : (promo.status || 'Borrador')).toUpperCase();
        let statusColor = 'text-[#76e474]';

        if (promo.project_type === 'estudio') {
            statusLabel = 'ANÁLISIS';
            statusColor = 'text-orange-400';
        }

        const profitability = promo.profitability ? `${promo.profitability}%` : '12.5%';
        const minInvestment = promo.min_investment ? `${promo.min_investment} €` : '500 €';
        const areaM2 = promo.area_m2 ? `${promo.area_m2} m2` : '— m2';
        const progress = promo.progress_percentage || 0;

        // Custom HTML based on type
        if (type === 'estudio') {
            div.innerHTML = `
                <div class="relative h-[350px] overflow-hidden">
                    <img src="${imageUrl}" class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="${promo.name}" />
                    <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                    <div class="absolute top-6 left-6 flex gap-2">
                        <span class="px-3 py-1 bg-orange-500/80 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-white">${statusLabel}</span>
                        <span class="px-3 py-1 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-white">${(promo.category || 'MIXTO').toUpperCase()}</span>
                    </div>
                </div>
                <div class="p-10">
                    <h3 class="text-3xl font-editorial font-bold mb-2">${promo.name}</h3>
                    <p class="text-sm text-slate-500 mb-8 font-light leading-relaxed">${promo.location}</p>
                    <p class="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-6">Superficie: ${areaM2}</p>
                    <div class="grid grid-cols-2 gap-4 border-t border-white/5 pt-8 mb-8">
                        <div>
                            <p class="text-[9px] text-slate-600 uppercase font-black mb-1">Inversión Est.</p>
                            <span class="text-xl font-bold text-[#76e474]">${minInvestment}</span>
                        </div>
                        <div>
                            <p class="text-[9px] text-slate-600 uppercase font-black mb-1">ROI Proyectado</p>
                            <span class="text-xl font-bold">${profitability}</span>
                        </div>
                    </div>
                    <a href="proyecto-detalle.html?id=${promo.id}" class="block w-full text-center bg-white/5 border border-white/10 text-white py-4 rounded-2xl font-bold text-sm hover:bg-[#76e474] hover:text-black transition-all">Ver Ficha Completa</a>
                </div>
            `;
        } else {
            // Standard Marketplace / Home Card
            div.innerHTML = `
                <div class="relative h-56 md:h-72 overflow-hidden">
                    <img src="${imageUrl}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="${promo.name}" />
                    <div class="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent opacity-60"></div>
                    <span class="absolute top-4 md:top-6 left-4 md:left-6 px-3 md:px-4 py-1 md:py-1.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-[9px] md:text-[10px] font-bold tracking-widest uppercase ${statusColor}">${statusLabel}</span>
                </div>
                <div class="p-5 sm:p-6 md:p-8">
                    <div class="flex justify-between items-start mb-4 sm:mb-5 md:mb-6">
                        <div>
                            <h3 class="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-white mb-1 tracking-tight leading-tight">${promo.name}</h3>
                            <p class="text-[10px] sm:text-xs md:text-xs text-slate-400 uppercase tracking-wide sm:tracking-widest font-bold">${promo.location}</p>
                            <p class="text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-2">Superficie: ${areaM2}</p>
                        </div>
                        <div class="text-right flex-shrink-0">
                            <p class="text-[#76e474] font-bold text-base sm:text-lg md:text-xl leading-none">${profitability}</p>
                            <p class="text-[9px] sm:text-[10px] md:text-xs text-slate-500 uppercase font-bold tracking-tight sm:tracking-normal">Rent. Est.</p>
                        </div>
                    </div>
                    <div class="space-y-3 mb-8">
                        <div class="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                            <span class="text-slate-400">Financiado al ${progress}%</span>
                            <span class="text-white">${promo.target_funding ? (promo.target_funding / 1000000).toFixed(2) + 'M' : '1.25M'} €</span>
                        </div>
                        <div class="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                            <div class="h-full bg-[#76e474] rounded-full shadow-[0_0_15px_rgba(118,228,116,0.5)]" style="width: ${progress}%"></div>
                        </div>
                    </div>
                    <div class="flex items-center justify-between pt-6 border-t border-white/5">
                        <div class="flex flex-col">
                            <span class="text-[9px] text-slate-500 uppercase font-bold tracking-widest mb-1">Inversión Mín.</span>
                            <span class="font-bold text-white tracking-tight text-lg">${minInvestment}</span>
                        </div>
                        <a href="proyecto-detalle.html?id=${promo.id}" class="bg-white text-black h-12 w-12 rounded-full flex items-center justify-center hover:bg-[#76e474] hover:text-white transition-all duration-300">
                            <span class="material-symbols-outlined text-xl">arrow_forward</span>
                        </a>
                    </div>
                </div>
            `;
        }

        return div;
    },

    navigation: {
        links: [
            { label: 'Inicio', href: 'index.html' },
            {
                label: 'Quiénes Somos',
                children: [
                    { label: 'Quiénes Somos', href: 'quienes-somos.html' },
                    { label: 'Sociedades del Grupo', href: 'sociedades.html' }
                ]
            },
            {
                label: 'Proyectos',
                children: [
                    { label: 'Promociones en Curso', href: 'marketplace.html' },
                    { label: 'Proyectos en Estudio', href: 'proyectos-estudio.html' }
                ]
            },
            {
                label: 'Inversión',
                children: [
                    { label: 'Crowdfunding', href: 'inversores.html' },
                    { label: 'Iniciativas', href: 'iniciativas.html' }
                ]
            }
        ],

        init: function () {
            const navContainer = document.getElementById('nav-links');
            const mobileNavContainer = document.getElementById('mobile-nav-links');

            if (navContainer) {
                navContainer.innerHTML = this.links.map(link => {
                    if (link.children) {
                        return `
                            <div class="relative group">
                                <button class="text-sm font-medium hover:text-[var(--primary)] transition-colors flex items-center gap-1">
                                    ${link.label}
                                    <span class="material-symbols-outlined text-xs">expand_more</span>
                                </button>
                                <div class="absolute top-full left-0 mt-2 w-56 glass-nav rounded-2xl border border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 shadow-2xl">
                                    ${link.children.map(child => `
                                        <a href="${child.href}" class="block px-6 py-3 text-sm hover:text-[var(--primary)] transition-colors border-b border-white/5 last:border-none">
                                            ${child.label}
                                        </a>
                                    `).join('')}
                                </div>
                            </div>
                        `;
                    }
                    return `<a class="text-sm font-medium hover:text-[var(--primary)] transition-colors" href="${link.href}">${link.label}</a>`;
                }).join('');
            }

            if (mobileNavContainer) {
                mobileNavContainer.innerHTML = this.links.map((link, idx) => {
                    if (link.children) {
                        const id = `mobile-dropdown-${idx}`;
                        return `
                            <div class="border-b border-white/5">
                                <button onclick="document.getElementById('${id}').classList.toggle('hidden'); this.querySelector('.arrow')?.classList.toggle('rotate-180')" 
                                        class="w-full flex items-center justify-between py-3 text-sm font-medium">
                                    <span>${link.label}</span>
                                    <span class="material-symbols-outlined text-sm transition-transform arrow">expand_more</span>
                                </button>
                                <div id="${id}" class="hidden pl-4 pb-2 space-y-2">
                                    ${link.children.map(child => `<a href="${child.href}" class="block py-2 text-sm text-slate-400 hover:text-[var(--primary)]">${child.label}</a>`).join('')}
                                </div>
                            </div>
                        `;
                    }
                    return `<a href="${link.href}" class="block py-3 text-sm font-medium border-b border-white/5">${link.label}</a>`;
                }).join('');
            }
        }
    }
};

window.UI = UI;
