import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function PanelPage() {
    redirect('/backoffice/promociones')
}
