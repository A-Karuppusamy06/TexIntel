import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Schema definitions for validation
const priceDatasetSchema = {
  requiredFields: ['date', 'material', 'price'],
  optionalFields: ['unit', 'region', 'source'],
  fieldTypes: {
    date: 'string',
    material: 'string',
    price: 'number',
    unit: 'string',
    region: 'string',
    source: 'string',
  }
}

const newsDatasetSchema = {
  requiredFields: ['id', 'title', 'summary', 'date'],
  optionalFields: ['source', 'category', 'url', 'image'],
  fieldTypes: {
    id: 'string',
    title: 'string',
    summary: 'string',
    date: 'string',
    source: 'string',
    category: 'string',
    url: 'string',
    image: 'string',
  }
}

function validateCSV(content: string): { valid: boolean; errors: string[]; rowCount: number } {
  const errors: string[] = []
  const lines = content.trim().split('\n')
  
  if (lines.length < 2) {
    return { valid: false, errors: ['CSV must have at least a header row and one data row'], rowCount: 0 }
  }

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
  
  // Check required fields
  for (const field of priceDatasetSchema.requiredFields) {
    if (!headers.includes(field)) {
      errors.push(`Missing required field: ${field}`)
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors, rowCount: 0 }
  }

  // Validate data rows
  const priceIndex = headers.indexOf('price')
  let validRows = 0

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',')
    
    if (values.length !== headers.length) {
      errors.push(`Row ${i + 1}: Column count mismatch`)
      continue
    }

    // Validate price is a number
    const price = parseFloat(values[priceIndex])
    if (isNaN(price)) {
      errors.push(`Row ${i + 1}: Invalid price value`)
      continue
    }

    validRows++
  }

  return { 
    valid: errors.length === 0 || validRows > 0, 
    errors, 
    rowCount: validRows 
  }
}

function validateJSON(content: string): { valid: boolean; errors: string[]; itemCount: number } {
  const errors: string[] = []
  
  let data: unknown
  try {
    data = JSON.parse(content)
  } catch {
    return { valid: false, errors: ['Invalid JSON format'], itemCount: 0 }
  }

  if (!Array.isArray(data)) {
    return { valid: false, errors: ['JSON must be an array of news items'], itemCount: 0 }
  }

  if (data.length === 0) {
    return { valid: false, errors: ['JSON array must contain at least one item'], itemCount: 0 }
  }

  // Validate each item
  let validItems = 0
  for (let i = 0; i < data.length; i++) {
    const item = data[i] as Record<string, unknown>
    let itemValid = true

    for (const field of newsDatasetSchema.requiredFields) {
      if (!(field in item)) {
        errors.push(`Item ${i + 1}: Missing required field: ${field}`)
        itemValid = false
      }
    }

    if (itemValid) validItems++
  }

  return { 
    valid: errors.length === 0 || validItems > 0, 
    errors, 
    itemCount: validItems 
  }
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

    // Verify user is admin
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

    const { action, datasetId, fileContent, fileType, fileName } = await req.json()

    if (action === 'validate') {
      // Validate dataset schema without processing
      console.log(`Validating ${fileType} dataset: ${fileName}`)
      
      let validationResult: { valid: boolean; errors: string[]; count: number }
      
      if (fileType === 'price') {
        const result = validateCSV(fileContent)
        validationResult = { valid: result.valid, errors: result.errors, count: result.rowCount }
      } else if (fileType === 'news') {
        const result = validateJSON(fileContent)
        validationResult = { valid: result.valid, errors: result.errors, count: result.itemCount }
      } else {
        return new Response(
          JSON.stringify({ error: 'Invalid file type. Must be "price" (CSV) or "news" (JSON)' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log(`Validation result: ${validationResult.valid}, errors: ${validationResult.errors.length}`)
      
      return new Response(
        JSON.stringify(validationResult),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'process') {
      // Process and update dataset
      console.log(`Processing dataset: ${datasetId}`)

      // Update dataset status to processing
      await supabase
        .from('datasets')
        .update({ status: 'processing' })
        .eq('id', datasetId)

      // Simulate processing (in real app, this would parse and update data tables)
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Mark as completed
      await supabase
        .from('datasets')
        .update({ 
          status: 'completed',
          processed_at: new Date().toISOString()
        })
        .eq('id', datasetId)

      console.log(`Dataset ${datasetId} processed successfully`)

      return new Response(
        JSON.stringify({ success: true, message: 'Dataset processed successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error processing dataset:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
