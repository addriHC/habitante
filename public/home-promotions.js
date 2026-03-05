const { createClient } = window.supabase

const supabaseUrl = window.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = window.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey)

async function loadHomePromotions() {
    const marketplaceSection = document.getElementById('marketplace')
    if (!marketplaceSection) return

    const grid = marketplaceSection.querySelector('.grid')
    if (!grid) return

    console.log("loadHomePromotions started, grid found")

    try {
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
