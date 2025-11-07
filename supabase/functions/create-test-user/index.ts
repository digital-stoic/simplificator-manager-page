Deno.serve(async (req) => {
  // Add CORS headers
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    // Create the test user using Admin API
    const createUserResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
        'apikey': serviceRoleKey,
      },
      body: JSON.stringify({
        email: 'test@simplificator.dev',
        password: 'Test1234!',
        email_confirm: true,
      })
    })

    const userData = await createUserResponse.json()

    if (!createUserResponse.ok) {
      console.error('Error creating user:', userData)
      return new Response(
        JSON.stringify({ error: userData.msg || userData.error_description || 'Failed to create user' }),
        { status: createUserResponse.status, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Create profile for the user
    const profileResponse = await fetch(`${supabaseUrl}/rest/v1/profiles`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
        'apikey': serviceRoleKey,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        id: userData.id,
        email: 'test@simplificator.dev',
      })
    })

    if (!profileResponse.ok) {
      const profileError = await profileResponse.text()
      console.error('Error creating profile:', profileError)
      return new Response(
        JSON.stringify({ error: 'User created but profile failed: ' + profileError }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Test user created successfully',
        email: 'test@simplificator.dev'
      }),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        } 
      }
    )
  } catch (error) {
    console.error('Unexpected error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        } 
      }
    )
  }
})
