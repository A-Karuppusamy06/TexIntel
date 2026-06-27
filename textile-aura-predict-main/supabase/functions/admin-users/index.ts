import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get auth header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify user
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check admin role
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle()

    if (!roleData) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { action, targetUserId, newRole, isApproved, isDisabled } = await req.json()

    if (action === 'list_users') {
      console.log('Admin fetching user list')

      // Get all profiles with their roles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (profilesError) throw profilesError

      // Get all roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')

      if (rolesError) throw rolesError

      // Combine profiles with roles
      const usersWithRoles = profiles.map(profile => ({
        ...profile,
        role: roles.find(r => r.user_id === profile.user_id)?.role || 'user'
      }))

      return new Response(
        JSON.stringify({ users: usersWithRoles }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'update_user') {
      console.log(`Admin updating user: ${targetUserId}`)

      // Update profile approval/disabled status
      if (isApproved !== undefined || isDisabled !== undefined) {
        const updates: Record<string, boolean> = {}
        if (isApproved !== undefined) updates.is_approved = isApproved
        if (isDisabled !== undefined) updates.is_disabled = isDisabled

        const { error: updateError } = await supabase
          .from('profiles')
          .update(updates)
          .eq('user_id', targetUserId)

        if (updateError) throw updateError
      }

      // Update role if provided
      if (newRole) {
        // Delete existing role
        await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', targetUserId)

        // Insert new role
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: targetUserId,
            role: newRole
          })

        if (roleError) throw roleError
      }

      console.log(`User ${targetUserId} updated successfully`)

      return new Response(
        JSON.stringify({ success: true, message: 'User updated successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'get_stats') {
      // Get user statistics
      const { data: profiles } = await supabase
        .from('profiles')
        .select('is_approved, is_disabled')

      const { data: datasets } = await supabase
        .from('datasets')
        .select('status')

      const { data: jobs } = await supabase
        .from('processing_jobs')
        .select('status')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

      const totalUsers = profiles?.length || 0
      const activeUsers = profiles?.filter(p => p.is_approved && !p.is_disabled).length || 0
      const pendingApprovals = profiles?.filter(p => !p.is_approved).length || 0
      const datasetsProcessed = datasets?.filter(d => d.status === 'completed').length || 0
      const jobsToday = jobs?.length || 0

      return new Response(
        JSON.stringify({
          stats: {
            totalUsers,
            activeUsers,
            pendingApprovals,
            datasetsProcessed,
            jobsToday
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in admin users:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
