/**
 * /fleet/boats/[boatId]/documents — Vessel documents and certificates
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, AlertTriangle, ExternalLink } from 'lucide-react'
import DocumentActions from './document-actions'

export default async function DocumentsPage({ params }: { params: { boatId: string } }) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: userRecord } = await supabase.from('users').select('company_id').eq('id', user.id).single()
  if (!userRecord) redirect('/login')
  const { data: company } = await supabase.from('companies').select('fleet_module_enabled').eq('id', userRecord.company_id).single()
  if (!company?.fleet_module_enabled) redirect('/fleet')
  const { data: boat } = await supabase.from('boats').select('id, name').eq('id', params.boatId).eq('company_id', userRecord.company_id).single()
  if (!boat) redirect('/fleet')

  const today = new Date().toISOString().split('T')[0]
  const soon = new Date(Date.now() + 30 * 864e5).toISOString().split('T')[0]

  const { data: docs } = await supabase
    .from('fleet_documents').select('*').eq('boat_id', params.boatId).neq('status', 'archived').order('name')

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href={`/fleet/boats/${params.boatId}`}><Button variant="outline" size="sm">← {boat.name}</Button></Link>
            <FileText className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-bold">Documents</h1>
          </div>
          <DocumentActions boatId={params.boatId} />
        </div>

        {docs && docs.length > 0 ? (
          <div className="space-y-2">
            {docs.map((doc) => {
              const expired = doc.expiry_date && doc.expiry_date < today
              const expiringSoon = doc.expiry_date && !expired && doc.expiry_date <= soon
              return (
                <Card key={doc.id}>
                  <CardContent className="py-3 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-sm truncate">{doc.name}</p>
                        {expired && <Badge variant="destructive" className="text-xs gap-1"><AlertTriangle className="w-3 h-3" />Expired</Badge>}
                        {expiringSoon && !expired && <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">Expiring soon</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground capitalize">
                        {doc.document_type.replace(/_/g, ' ')}
                        {doc.expiry_date && ` · Expires ${doc.expiry_date}`}
                      </p>
                    </div>
                    <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="shrink-0">
                      <Button variant="ghost" size="sm"><ExternalLink className="w-4 h-4" /></Button>
                    </a>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No documents uploaded yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
