'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import {
  Plus,
  Edit,
  Trash2,
  Users,
  TrendingUp,
  DollarSign,
  Award,
  Loader2,
  Search
} from 'lucide-react'

type Agent = {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  role: string
  commission_percentage: number
  hourly_rate: number | null
  is_active: boolean
  created_at: string
  // Performance metrics
  total_bookings?: number
  total_revenue?: number
  pending_commission?: number
}

type AgentsClientProps = {
  agents: Agent[]
  currentUserRole: string
}

const ROLES = [
  { value: 'admin', label: 'Admin', description: 'Full system access' },
  { value: 'manager', label: 'Manager', description: 'Manage bookings, agents, and pricing' },
  { value: 'power_agent', label: 'Power Agent', description: 'Create and manage all bookings' },
  { value: 'regular_agent', label: 'Regular Agent', description: 'Create bookings with holds' },
  { value: 'office_staff', label: 'Office Staff', description: 'View-only access' },
  { value: 'captain', label: 'Captain', description: 'Boat captain with hourly rate' },
  { value: 'sailor', label: 'Sailor', description: 'Crew member with hourly rate' },
]

export default function AgentsClient({ agents: initialAgents, currentUserRole }: AgentsClientProps) {
  const router = useRouter()
  const [agents, setAgents] = useState(initialAgents)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Dialog states
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [loading, setLoading] = useState(false)

  // Form states
  const [formFirstName, setFormFirstName] = useState('')
  const [formLastName, setFormLastName] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formRole, setFormRole] = useState('regular_agent')
  const [formCommission, setFormCommission] = useState('10')
  const [formHourlyRate, setFormHourlyRate] = useState('0')
  const [formPassword, setFormPassword] = useState('')
  const [formIsActive, setFormIsActive] = useState(true)

  // Check if current user can manage agents (admin or manager only)
  const canManageAgents = currentUserRole === 'admin' || currentUserRole === 'manager'

  // Filter agents
  const filteredAgents = useMemo(() => {
    return agents.filter(agent => {
      const matchesSearch =
        agent.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.email.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesRole = roleFilter === 'all' || agent.role === roleFilter
      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'active' && agent.is_active) ||
        (statusFilter === 'inactive' && !agent.is_active)

      return matchesSearch && matchesRole && matchesStatus
    })
  }, [agents, searchQuery, roleFilter, statusFilter])

  // Calculate summary statistics
  const stats = useMemo(() => {
    const activeAgents = agents.filter(a => a.is_active).length
    const totalBookings = agents.reduce((sum, a) => sum + (a.total_bookings || 0), 0)
    const totalRevenue = agents.reduce((sum, a) => sum + (a.total_revenue || 0), 0)
    const pendingCommission = agents.reduce((sum, a) => sum + (a.pending_commission || 0), 0)

    return { activeAgents, totalBookings, totalRevenue, pendingCommission }
  }, [agents])

  const resetForm = () => {
    setFormFirstName('')
    setFormLastName('')
    setFormEmail('')
    setFormPhone('')
    setFormRole('regular_agent')
    setFormCommission('10')
    setFormHourlyRate('0')
    setFormPassword('')
    setFormIsActive(true)
  }

  const handleAddAgent = async () => {
    if (!formFirstName || !formLastName || !formEmail || !formPassword) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/agents/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formFirstName,
          lastName: formLastName,
          email: formEmail,
          phone: formPhone || null,
          role: formRole,
          commissionPercentage: parseFloat(formCommission),
          hourlyRate: parseFloat(formHourlyRate),
          password: formPassword,
          isActive: formIsActive,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create agent')
      }

      toast.success('Agent created successfully!')
      setShowAddDialog(false)
      resetForm()
      router.refresh()
    } catch (error: any) {
      toast.error('Failed to create agent', {
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEditAgent = async () => {
    if (!selectedAgent) return

    if (!formFirstName || !formLastName || !formEmail) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/agents/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: selectedAgent.id,
          firstName: formFirstName,
          lastName: formLastName,
          email: formEmail,
          phone: formPhone || null,
          role: formRole,
          commissionPercentage: parseFloat(formCommission),
          hourlyRate: parseFloat(formHourlyRate),
          isActive: formIsActive,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update agent')
      }

      toast.success('Agent updated successfully!')
      setShowEditDialog(false)
      setSelectedAgent(null)
      resetForm()
      router.refresh()
    } catch (error: any) {
      toast.error('Failed to update agent', {
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAgent = async () => {
    if (!selectedAgent) return

    setLoading(true)
    try {
      const response = await fetch('/api/agents/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: selectedAgent.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete agent')
      }

      toast.success('Agent deleted successfully!')
      setShowDeleteDialog(false)
      setSelectedAgent(null)
      router.refresh()
    } catch (error: any) {
      toast.error('Failed to delete agent', {
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  const openEditDialog = (agent: Agent) => {
    setSelectedAgent(agent)
    setFormFirstName(agent.first_name)
    setFormLastName(agent.last_name)
    setFormEmail(agent.email)
    setFormPhone(agent.phone || '')
    setFormRole(agent.role)
    setFormCommission(agent.commission_percentage.toString())
    setFormHourlyRate((agent.hourly_rate || 0).toString())
    setFormIsActive(agent.is_active)
    setShowEditDialog(true)
  }

  const openDeleteDialog = (agent: Agent) => {
    setSelectedAgent(agent)
    setShowDeleteDialog(true)
  }

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
              Active Agents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.activeAgents}</p>
            <p className="text-xs text-muted-foreground mt-1">of {agents.length} total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Total Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalBookings}</p>
            <p className="text-xs text-muted-foreground mt-1">all time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">€{stats.totalRevenue.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground mt-1">generated by team</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Award className="w-4 h-4" />
              Pending Commission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">€{stats.pendingCommission.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground mt-1">to be paid</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Team Members ({filteredAgents.length})</CardTitle>
              <CardDescription>Manage agents, staff, and team members</CardDescription>
            </div>
            {canManageAgents && (
              <Button onClick={() => setShowAddDialog(true)} className="w-full md:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Add Agent
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search agents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {ROLES.map(role => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Agents List */}
          <div className="space-y-2">
            {filteredAgents.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No agents found</p>
              </div>
            ) : (
              filteredAgents.map((agent) => (
                <div
                  key={agent.id}
                  className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-3">
                      <p className="font-semibold">
                        {agent.first_name} {agent.last_name}
                      </p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        agent.role === 'admin'
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                          : agent.role === 'manager'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                          : agent.role === 'power_agent'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                      }`}>
                        {agent.role.replace('_', ' ')}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        agent.is_active
                          ? 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                      }`}>
                        {agent.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{agent.email}</p>
                    <p className="text-sm text-muted-foreground">
                      {agent.phone || 'No phone'}
                    </p>
                  </div>

                  <div className="mt-3 md:mt-0 flex flex-col md:flex-row md:items-center gap-4">
                    {/* Performance Metrics */}
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-xs text-muted-foreground">Bookings</p>
                        <p className="text-lg font-semibold">{agent.total_bookings || 0}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Revenue</p>
                        <p className="text-lg font-semibold">€{(agent.total_revenue || 0).toFixed(0)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Commission</p>
                        <p className="text-lg font-semibold text-green-600">
                          {agent.commission_percentage}%
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    {canManageAgents && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(agent)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDeleteDialog(agent)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Agent Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Agent</DialogTitle>
            <DialogDescription>
              Create a new team member account. They will receive login credentials.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formFirstName}
                  onChange={(e) => setFormFirstName(e.target.value)}
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formLastName}
                  onChange={(e) => setFormLastName(e.target.value)}
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="john@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="+30 69..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
                placeholder="Minimum 6 characters"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select value={formRole} onValueChange={setFormRole}>
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map(role => (
                      <SelectItem key={role.value} value={role.value}>
                        <div>
                          <p className="font-medium">{role.label}</p>
                          <p className="text-xs text-muted-foreground">{role.description}</p>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formRole === 'captain' || formRole === 'sailor' ? (
                <div className="space-y-2">
                  <Label htmlFor="hourlyRate">Hourly Rate (€)</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    min="0"
                    step="0.5"
                    value={formHourlyRate}
                    onChange={(e) => setFormHourlyRate(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="commission">Commission %</Label>
                  <Input
                    id="commission"
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={formCommission}
                    onChange={(e) => setFormCommission(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formIsActive}
                onChange={(e) => setFormIsActive(e.target.checked)}
                className="w-4 h-4"
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                Active (agent can log in)
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleAddAgent} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Agent'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Agent Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Agent</DialogTitle>
            <DialogDescription>
              Update agent information and permissions.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editFirstName">First Name *</Label>
                <Input
                  id="editFirstName"
                  value={formFirstName}
                  onChange={(e) => setFormFirstName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editLastName">Last Name *</Label>
                <Input
                  id="editLastName"
                  value={formLastName}
                  onChange={(e) => setFormLastName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editEmail">Email *</Label>
              <Input
                id="editEmail"
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editPhone">Phone</Label>
              <Input
                id="editPhone"
                type="tel"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editRole">Role *</Label>
                <Select value={formRole} onValueChange={setFormRole}>
                  <SelectTrigger id="editRole">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map(role => (
                      <SelectItem key={role.value} value={role.value}>
                        <div>
                          <p className="font-medium">{role.label}</p>
                          <p className="text-xs text-muted-foreground">{role.description}</p>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formRole === 'captain' || formRole === 'sailor' ? (
                <div className="space-y-2">
                  <Label htmlFor="editHourlyRate">Hourly Rate (€)</Label>
                  <Input
                    id="editHourlyRate"
                    type="number"
                    min="0"
                    step="0.5"
                    value={formHourlyRate}
                    onChange={(e) => setFormHourlyRate(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="editCommission">Commission %</Label>
                  <Input
                    id="editCommission"
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={formCommission}
                    onChange={(e) => setFormCommission(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="editIsActive"
                checked={formIsActive}
                onChange={(e) => setFormIsActive(e.target.checked)}
                className="w-4 h-4"
              />
              <Label htmlFor="editIsActive" className="cursor-pointer">
                Active (agent can log in)
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleEditAgent} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Agent Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Agent</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedAgent?.first_name} {selectedAgent?.last_name}?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>Warning:</strong> Deleting this agent will not delete their bookings, but they will no longer be able to log in or create new bookings.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={loading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAgent} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Agent'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
