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

    const { action, jobType } = await req.json()

    if (action === 'trigger_job') {
      console.log(`Admin ${user.id} triggering job: ${jobType}`)

      // Create processing job
      const { data: job, error: jobError } = await supabase
        .from('processing_jobs')
        .insert({
          job_type: jobType,
          status: 'pending',
          triggered_by: user.id
        })
        .select()
        .single()

      if (jobError) {
        throw jobError
      }

      // Start job (update to running)
      await supabase
        .from('processing_jobs')
        .update({ 
          status: 'running',
          started_at: new Date().toISOString()
        })
        .eq('id', job.id)

      // Simulate job execution based on type
      const jobDuration = jobType === 'full_sync' ? 5000 : jobType === 'refresh_ai' ? 3000 : 2000
      
      await new Promise(resolve => setTimeout(resolve, jobDuration))

      // Complete job
      await supabase
        .from('processing_jobs')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', job.id)

      console.log(`Job ${job.id} completed successfully`)

      return new Response(
        JSON.stringify({ 
          success: true, 
          jobId: job.id,
          message: `${jobType} completed successfully` 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'get_jobs') {
      // Get recent jobs
      const { data: jobs, error: jobsError } = await supabase
        .from('processing_jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      if (jobsError) throw jobsError

      return new Response(
        JSON.stringify({ jobs }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'get_datasets') {
      // Get recent datasets
      const { data: datasets, error: datasetsError } = await supabase
        .from('datasets')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)

      if (datasetsError) throw datasetsError

      return new Response(
        JSON.stringify({ datasets }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in admin workflow:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
