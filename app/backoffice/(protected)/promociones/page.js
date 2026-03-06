import { createClient } from '@/utils/supabase/server'
import PromotionsTable from './PromotionsTable'

export const dynamic = 'force-dynamic'

export default async function PromotionsPage() {
    const supabase = await createClient()

    // Fetch all promotions on the server
    const { data: promotions, error } = await supabase
        .from('promotions')
        .select('*')
        .order('priority', { ascending: false })

    if (error) {
        // Fallback or error UI could be improved here, but passing empty data for now
        console.error('Data fetch error:', error)
        return <PromotionsTable initialData={[]} />
    }

    return (
        <main className="bo-shell">
            <PromotionsTable initialData={promotions || []} />
        </main>
    )
}
