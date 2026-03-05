(function () {
const supabaseUrl = window.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = window.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!window.supabase?.createClient) {
    console.error('Supabase library is not loaded')
    return
}

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase configuration (url/key)')
    return
}

const supabaseClient = window.__habitanteSupabaseClient ||
    (window.__habitanteSupabaseClient = window.supabase.createClient(supabaseUrl, supabaseAnonKey))

async function loadProjectDetails() {
    const urlParams = new URLSearchParams(window.location.search)
    const projectId = urlParams.get('id')

    if (!projectId) {
        return
    }

    try {
        const { data: promo, error } = await supabaseClient
            .from('promotions')
            .select('*')
            .eq('id', projectId)
            .single()

        if (error) throw error
        if (!promo) return

        renderProject(promo)
    } catch (err) {
        console.error('Error loading project details:', err)
    }
}

function renderProject(promo) {
    document.title = `${promo.name} | Habitante`

    // Hero Section
    const heroBg = document.getElementById('project-hero-bg')
    if (heroBg && promo.main_image_url) {
        heroBg.src = promo.main_image_url
        heroBg.onload = () => heroBg.classList.replace('opacity-0', 'opacity-100')
    }

    const titleEl = document.getElementById('project-title')
    if (titleEl) titleEl.textContent = promo.name

    const locationText = document.querySelector('#project-location-text span:last-child')
    if (locationText) locationText.textContent = promo.location

    const typeText = document.getElementById('project-type-text')
    if (typeText) typeText.textContent = (promo.project_type || 'Residencial').toUpperCase()

    const statusBadge = document.getElementById('project-status-badge')
    if (statusBadge) {
        let statusStr = (promo.investment_status || promo.status || 'En curso').toUpperCase()
        if (promo.progress_percentage) statusStr += ` - ${promo.progress_percentage}%`
        statusBadge.textContent = statusStr
    }

    // Description
    const descriptionEl = document.getElementById('project-description')
    if (descriptionEl) descriptionEl.textContent = promo.description || 'Sin descripción disponible.'



    // Gallery
    const gallerySection = document.getElementById('gallery-section')
    const galleryGrid = document.getElementById('project-gallery-grid')
    if (galleryGrid && promo.gallery_images && promo.gallery_images.length > 0) {
        gallerySection.classList.remove('hidden')
        galleryGrid.innerHTML = promo.gallery_images.map((img, idx) => `
            <div class="overflow-hidden aspect-video shadow-xl border border-white/5 cursor-pointer" data-index="${idx}">
                <img src="${img}" class="w-full h-full object-cover fetch-priority-low" loading="lazy" />
            </div>
        `).join('')

        // set up simple lightbox carousel
        const galleryItems = galleryGrid.querySelectorAll('[data-index]');
        const overlay = document.getElementById('lightbox-overlay');
        const overlayImg = document.getElementById('lightbox-img');
        const prevBtn = document.getElementById('lightbox-prev');
        const nextBtn = document.getElementById('lightbox-next');
        const closeBtn = document.getElementById('lightbox-close');
        let currentIndex = 0;

        const showIndex = (idx) => {
            currentIndex = (idx + promo.gallery_images.length) % promo.gallery_images.length;
            if (overlayImg) overlayImg.src = promo.gallery_images[currentIndex];
        };

        const openLightbox = (idx) => {
            showIndex(idx);
            if (overlay) {
                overlay.classList.remove('hidden');
                overlay.classList.add('flex');
            }
        };
        const closeLightbox = () => {
            if (overlay) {
                overlay.classList.add('hidden');
                overlay.classList.remove('flex');
            }
        };

        galleryItems.forEach(el => {
            el.addEventListener('click', () => openLightbox(parseInt(el.dataset.index)));
        });
        prevBtn?.addEventListener('click', (e) => { e.stopPropagation(); showIndex(currentIndex - 1); });
        nextBtn?.addEventListener('click', (e) => { e.stopPropagation(); showIndex(currentIndex + 1); });
        closeBtn?.addEventListener('click', (e) => { e.stopPropagation(); closeLightbox(); });
        overlay?.addEventListener('click', (e) => {
            if (e.target === overlay) closeLightbox();
        });
        // simple swipe support
        let touchStartX = 0;
        overlay?.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].clientX;
        });
        overlay?.addEventListener('touchend', (e) => {
            const dx = e.changedTouches[0].clientX - touchStartX;
            if (Math.abs(dx) > 50) {
                if (dx > 0) showIndex(currentIndex - 1);
                else showIndex(currentIndex + 1);
            }
        });
    }

    // Video Section
    if (promo.youtube_url) {
        const videoSection = document.getElementById('video-section')
        const videoIframe = document.getElementById('project-video')
        
        // Extract video ID from various YouTube URL formats
        let videoId = ''
        const youtubeUrl = promo.youtube_url
        
        if (youtubeUrl.includes('youtube.com/watch?v=')) {
            videoId = youtubeUrl.split('v=')[1]?.split('&')[0]
        } else if (youtubeUrl.includes('youtu.be/')) {
            videoId = youtubeUrl.split('youtu.be/')[1]?.split('?')[0]
        }
        
        if (videoId) {
            videoSection.classList.remove('hidden')
            videoIframe.src = `https://www.youtube.com/embed/${videoId}?rel=0`
        }
    }

    // Sidebar Financials
    const financialRowsContainer = document.getElementById('financial-sidebar-rows');
    if (financialRowsContainer) {
        const rows = [
            {
                label: 'Rentabilidad',
                value: promo.profitability ? `${promo.profitability}%` : '---%',
                subValue: (promo.profitability_type || 'TOTAL').toUpperCase(),
                isPrimary: true
            },
            {
                label: 'Meta de Financiación',
                value: promo.target_funding ? `${promo.target_funding.toLocaleString('es-ES')} €` : '--- €'
            },
            {
                label: 'Plazo Est.',
                value: promo.duration_months ? `${promo.duration_months} Meses` : '---'
            },
            {
                label: 'Superficie',
                value: promo.area_m2 ? `${promo.area_m2.toLocaleString('es-ES')} m2` : '--- m2'
            },
            {
                label: 'Ticket Mín.',
                value: promo.min_investment ? `${promo.min_investment.toLocaleString('es-ES')} €` : '--- €'
            },
            {
                label: 'Estado',
                value: (promo.investment_status || 'CONSULTAR').toUpperCase(),
                isStatus: true
            }
        ];

        financialRowsContainer.innerHTML = rows.map(row => `
            <div class="flex justify-between items-end border-b border-white/5 pb-4">
                <span class="text-slate-500 text-xs uppercase font-black tracking-widest">${row.label}</span>
                <div class="text-right">
                    <span class="${row.isPrimary ? 'text-3xl text-[var(--primary)]' : row.isStatus ? 'text-[var(--primary)] text-xs' : 'text-xl'} font-bold block leading-none">
                        ${row.value}
                    </span>
                    ${row.subValue ? `<span class="text-[9px] text-slate-500 uppercase font-bold tracking-tighter">${row.subValue}</span>` : ''}
                </div>
            </div>
        `).join('');
    }

    // Documents
    const docSection = document.getElementById('project-documents-section')
    const docGrid = document.getElementById('project-docs-grid')
    if (docSection && docGrid) {
        const docs = []
        if (promo.pdf_url) docs.push({ name: 'Dossier de Inversión', url: promo.pdf_url, icon: 'picture_as_pdf' })
        if (promo.drive_link_1) docs.push({ name: 'Planos y Tipologías', url: promo.drive_link_1, icon: 'architecture' })

        if (docs.length > 0) {
            docSection.classList.remove('hidden')
            docGrid.innerHTML = docs.map(doc => `
                <a href="${doc.url}" target="_blank"
                    class="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5 hover:border-[var(--primary)]/50 transition-all group">
                    <div class="flex items-center gap-4">
                        <span class="material-symbols-outlined text-[var(--primary)]">${doc.icon}</span>
                        <span class="text-sm font-bold text-white">${doc.name}</span>
                    </div>
                    <span class="material-symbols-outlined text-xs text-slate-500 group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </a>
            `).join('')
        }
    }

    // Map
    const mapContainer = document.getElementById('location-map-container')
    if (mapContainer && promo.kml_url) {
        const map = L.map('location-map-container', { zoomControl: false }).setView([40.4168, -3.7038], 10)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            subdomains: 'abcd',
            maxZoom: 20
        }).addTo(map)

        omnivore.kml(promo.kml_url).on('ready', function () {
            this.setStyle({ color: 'var(--primary)', weight: 4, opacity: 0.8 })
            map.fitBounds(this.getBounds())
        }).addTo(map)

        document.getElementById('map-placeholder')?.classList.add('hidden')
        document.getElementById('map-fallback-img')?.classList.add('hidden')
    }

    // Simulator Update
    const simRange = document.getElementById('simulator-range')
    const simAmount = document.getElementById('simulator-amount')
    const simReturn = document.getElementById('simulator-return')
    
    if (simRange && simAmount && simReturn) {
        const rate = parseFloat(promo.profitability) || 0
        const min = parseInt(promo.min_investment) || 500
        const max = parseInt(promo.target_funding) || 50000

        simRange.min = min.toString()
        simRange.max = max.toString()
        simRange.value = min.toString()

        const updateSim = (val) => {
            const numVal = parseInt(val) || min
            let result = numVal * (rate / 100)
            
            if (promo.profitability_type === 'anual' && promo.duration_months) {
                result = result * (promo.duration_months / 12)
            }

            simAmount.textContent = `${numVal.toLocaleString('es-ES')} €`
            simReturn.textContent = `${Math.round(result).toLocaleString('es-ES')} €`
        }

        simRange.addEventListener('input', (e) => updateSim(e.target.value))
        simRange.addEventListener('change', (e) => updateSim(e.target.value))
        updateSim(min)
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const isProjectDetailPage = !!document.getElementById('project-title') && !!document.getElementById('project-status-badge');
    if (!isProjectDetailPage) return;

    if (window.UI && window.UI.navigation) {
        window.UI.navigation.init();
    }
    loadProjectDetails();

    // Modal handlers
    const investModal = document.getElementById('invest-modal');
    const mobileMenu = document.getElementById('mobile-menu');

    const openModal = () => { if (investModal) investModal.classList.remove('hidden'); };
    const closeModal = () => { if (investModal) investModal.classList.add('hidden'); };

    const openMobileMenu = () => {
        if (mobileMenu) mobileMenu.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    };
    const closeMobileMenu = () => {
        if (mobileMenu) mobileMenu.classList.add('hidden');
        document.body.style.overflow = '';
    };

    // Button Listeners
    document.getElementById('nav-invest-btn')?.addEventListener('click', openModal);
    document.getElementById('sidebar-invest-btn')?.addEventListener('click', openModal);
    document.getElementById('mobile-invest-btn')?.addEventListener('click', () => {
        closeMobileMenu();
        openModal();
    });

    document.getElementById('invest-modal-backdrop')?.addEventListener('click', closeModal);

    document.getElementById('mobile-menu-btn')?.addEventListener('click', openMobileMenu);
    document.getElementById('close-mobile-menu')?.addEventListener('click', closeMobileMenu);
    document.getElementById('mobile-menu-backdrop')?.addEventListener('click', closeMobileMenu);
});

})();
