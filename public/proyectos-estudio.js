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

async function loadEstudioPromotions() {
    const assetGrid = document.getElementById('estudio-grid')
    if (!assetGrid) return

    assetGrid.innerHTML = '<div class="col-span-full py-20 text-center text-slate-500">Cargando proyectos en estudio...</div>'

    try {
        const { data: promotions, error } = await supabaseClient
            .from('promotions')
            .select('*')
            .eq('status', 'published')
            .order('priority', { ascending: false })

        console.log("RAW SUPABASE RESPONSE:", { promotions, error })

        if (error) throw error

        const filteredPromotions = (promotions || []).filter(p => p.project_type === 'estudio')

        if (filteredPromotions.length === 0) {
            assetGrid.innerHTML = '<div class="col-span-full py-20 text-center text-slate-500">No hay proyectos en estudio en este momento.</div>'
            return
        }

        assetGrid.innerHTML = '' // Clear existing

        filteredPromotions.forEach(promo => {
            const card = window.UI.createCard(promo, 'estudio')
            assetGrid.appendChild(card)
        })

    } catch (err) {
        console.error('Error loading estudio promotions:', err)
        assetGrid.innerHTML = '<div class="col-span-full py-20 text-center text-red-500">Error al cargar los proyectos. Por favor, inténtalo de nuevo más tarde.</div>'
    }
}

// Initial load
document.addEventListener('DOMContentLoaded', loadEstudioPromotions)

})();
