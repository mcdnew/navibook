'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle2, Building2, Loader2, Mail, Phone, MapPin } from 'lucide-react'

interface Company {
  id: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
}

interface CompanyInfoEditorProps {
  isAdmin: boolean
}

export default function CompanyInfoEditor({ isAdmin }: CompanyInfoEditorProps) {
  const [company, setCompany] = useState<Company | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  // Fetch current company info
  useEffect(() => {
    fetchCompanyInfo()
  }, [])

  const fetchCompanyInfo = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/company/info')
      if (!response.ok) throw new Error('Failed to fetch company info')

      const data = await response.json()
      setCompany(data.company)
      setName(data.company.name)
      setEmail(data.company.email || '')
      setPhone(data.company.phone || '')
      setAddress(data.company.address || '')
    } catch (err: any) {
      setError(err.message || 'Failed to load company information')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    // Clear previous messages
    setError('')
    setSuccess('')

    // Validate
    if (!name.trim()) {
      setError('Company name is required')
      return
    }

    try {
      setSaving(true)
      const response = await fetch('/api/company/info', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim() || null,
          phone: phone.trim() || null,
          address: address.trim() || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update company information')
      }

      const data = await response.json()
      setCompany(data.company)
      setSuccess('Company information updated successfully!')
      setIsEditing(false)
      setTimeout(() => setSuccess(''), 5000)
    } catch (err: any) {
      setError(err.message || 'Failed to update company information')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (company) {
      setName(company.name)
      setEmail(company.email || '')
      setPhone(company.phone || '')
      setAddress(company.address || '')
    }
    setError('')
    setSuccess('')
    setIsEditing(false)
  }

  if (loading) {
    return (
      <Card className="maritime-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Company Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="maritime-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>
              <Building2 className="w-5 h-5 inline mr-2" />
              Company Information
            </CardTitle>
          </div>
          {isAdmin && !isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              Edit
            </Button>
          )}
        </div>
        {isAdmin && (
          <CardDescription>
            {isEditing ? 'Edit your company details' : 'Your company details'}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Messages */}
        {error && (
          <div className="flex gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="flex gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-800">{success}</p>
          </div>
        )}

        {isEditing ? (
          <>
            {/* Edit Mode */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">
                  Company Name
                  <span className="text-red-500">*</span>
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter company name"
                  disabled={saving}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email (Optional)
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="company@example.com"
                  disabled={saving}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone (Optional)
                </label>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+34 123 456 789"
                  disabled={saving}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Address (Optional)
                </label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street address, city, country"
                  disabled={saving}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={saving}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* View Mode */}
            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Company Name
              </label>
              <p className="text-lg font-semibold mt-1">{company?.name}</p>
            </div>

            {company?.email && (
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </label>
                <p className="text-lg font-semibold mt-1">{company.email}</p>
              </div>
            )}

            {company?.phone && (
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone
                </label>
                <p className="text-lg font-semibold mt-1">{company.phone}</p>
              </div>
            )}

            {company?.address && (
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Address
                </label>
                <p className="text-lg font-semibold mt-1">{company.address}</p>
              </div>
            )}

            {!isAdmin && (
              <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 mt-4">
                <p className="text-sm text-amber-800">
                  Only admins can edit company information. Contact your administrator to update these details.
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
