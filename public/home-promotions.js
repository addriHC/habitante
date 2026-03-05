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

async function loadHomePromotions() {
    const marketplaceSection = document.getElementById('marketplace')
    if (!marketplaceSection) return

    const grid = marketplaceSection.querySelector('.grid')
    if (!grid) return

    console.log("loadHomePromotions started, grid found")

    try {
        // first, compute active (non-archived) promotion count separately
        const { count: activeCount, error: countError } = await supabaseClient
            .from('promotions')
            .select('id', { count: 'exact', head: true })
            .neq('status', 'archived')

        if (countError) {
            console.error('Error fetching active promotions count:', countError)
        } else if (typeof activeCount === 'number') {
            const counterEl = document.getElementById('active-count')
            if (counterEl) {
                // show number with plus sign if there are any promotions
                counterEl.textContent = activeCount + (activeCount > 0 ? '' : '')
            }
        }

        const { data: promotions, error } = await supabaseClient
            .from('promotions')
            .select('*')
            .eq('status', 'published')
            .order('priority', { ascending: false })

        console.log("RAW SUPABASE RESPONSE:", { promotions, error })

        if (error) throw error
        if (!promotions) return

        // Fallback for project_type filter if not in database yet (undefined => promocion)
        const filteredPromotions = promotions.filter(p => p.project_type !== 'estudio').slice(0, 3)
        console.log("Filtered Home Promotions:", filteredPromotions)

        grid.innerHTML = '' // Clear placeholders always

        if (filteredPromotions.length === 0) {
            grid.innerHTML = '<div class="col-span-full py-20 text-center text-slate-500">No hay oportunidades publicadas en este momento.</div>'
            return
        }

        filteredPromotions.forEach(promo => {
            const card = window.UI.createCard(promo, 'home')
            grid.appendChild(card)
        })

    } catch (err) {
        console.error('Error loading home promotions:', err)
    }
}

document.addEventListener('DOMContentLoaded', loadHomePromotions)

})();
