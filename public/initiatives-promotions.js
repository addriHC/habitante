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

async function loadInitiativePromotions() {
    const initiativeGrid = document.getElementById('initiative-grid')
    if (!initiativeGrid) return

    console.log("loadInitiativePromotions started, initiative-grid found")
    initiativeGrid.innerHTML = '<div class="col-span-full py-20 text-center text-slate-500">Cargando iniciativas...</div>'

    try {
        const { data: promotions, error } = await supabaseClient
            .from('promotions')
            .select('*')
            .eq('status', 'published')
            .order('priority', { ascending: false })

        if (error) throw error
        if (!promotions) return

        // Filter promotions that have is_initiative=true in metadata
        const initiativePromotions = promotions.filter(p => {
            const metadata = p.metadata || {}
            return metadata.is_initiative === true || metadata.is_initiative === 'true'
        })

        console.log("Filtered Initiative Promotions:", initiativePromotions)

        initiativeGrid.innerHTML = '' // Clear placeholders

        if (initiativePromotions.length === 0) {
            initiativeGrid.innerHTML = '<div class="col-span-full py-20 text-center text-slate-500">No hay iniciativas publicadas en este momento.</div>'
            return
        }

        initiativePromotions.forEach(promo => {
            const card = window.UI.createCard(promo, 'marketplace')
            initiativeGrid.appendChild(card)
        })

    } catch (err) {
        console.error('Error loading initiative promotions:', err)
        initiativeGrid.innerHTML = '<div class="col-span-full py-20 text-center text-red-500">Error al cargar las iniciativas.</div>'
    }
}

document.addEventListener('DOMContentLoaded', loadInitiativePromotions)

})();
