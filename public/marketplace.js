const { createClient } = window.supabase

const supabaseUrl = window.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = window.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const supabaseClient = createClient(supabaseUrl, supabaseAnonKey)

const statusLabels = {
    published: 'Publicado',
    draft: 'Borrador',
    archived: 'Archivado'
}

const statusColors = {
    published: 'text-[var(--primary)]',
    draft: 'text-slate-400',
    archived: 'text-red-400'
}

let allPromotions = []

async function loadPromotions() {
    const assetGrid = document.getElementById('asset-grid')
    if (!assetGrid) return

    console.log("loadPromotions started, assetGrid found")
    assetGrid.innerHTML = '<div class="col-span-full py-20 text-center text-slate-500">Cargando activos...</div>'

    try {
        const { data: promotions, error } = await supabaseClient
            .from('promotions')
            .select('*')
            .eq('status', 'published')
            .order('priority', { ascending: false })

        console.log("RAW SUPABASE RESPONSE:", { promotions, error })

        if (error) throw error

        // Filter out estudio for the main marketplace (they have their own page)
        allPromotions = (promotions || []).filter(p => p.project_type !== 'estudio')
        console.log("Loaded Promotions:", allPromotions)

        renderPromotions(allPromotions)

    } catch (err) {
        console.error('Error loading promotions:', err)
        assetGrid.innerHTML = '<div class="col-span-full py-20 text-center text-red-500">Error al cargar las promociones.</div>'
    }
}

function renderPromotions(promotionsToRender) {
    const assetGrid = document.getElementById('asset-grid')
    if (!assetGrid) return

    if (promotionsToRender.length === 0) {
        assetGrid.innerHTML = '<div class="col-span-full py-20 text-center text-slate-500">No se han encontrado promociones con los filtros seleccionados.</div>'
        return
    }

    assetGrid.innerHTML = ''
    promotionsToRender.forEach(promo => {
        const card = window.UI.createCard(promo, 'marketplace')
        assetGrid.appendChild(card)
    })
}

function applyFilters() {
    const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || ''
    const typeFilter = document.getElementById('type-filter')?.value.toLowerCase() || ''
    const statusFilter = document.getElementById('status-filter')?.value.toLowerCase() || ''

    const filtered = allPromotions.filter(promo => {
        const matchesSearch = !searchTerm ||
            promo.name?.toLowerCase().includes(searchTerm) ||
            promo.location?.toLowerCase().includes(searchTerm)

        // Note: category/project_type might need to be refined based on DB schema
        const matchesType = !typeFilter || promo.category?.toLowerCase() === typeFilter

        // investment_status is what we use for "en curso", "finalizado", etc.
        const matchesStatus = !statusFilter || (promo.investment_status?.toLowerCase().replace(' ', '-') === statusFilter)

        return matchesSearch && matchesType && matchesStatus
    })

    renderPromotions(filtered)
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    loadPromotions()

    document.getElementById('filter-btn')?.addEventListener('click', applyFilters)
    document.getElementById('search-input')?.addEventListener('input', applyFilters)
    document.getElementById('type-filter')?.addEventListener('change', applyFilters)
    document.getElementById('status-filter')?.addEventListener('change', applyFilters)
})
