import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { createAsyncThunk } from '@reduxjs/toolkit'
import { createSupabaseClient } from '@/lib/supabase'

interface User {
  id: string
  email: string
  first_name?: string
  last_name?: string
  is_admin?: boolean
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload
      state.isAuthenticated = !!action.payload
      state.error = null
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    logout: (state) => {
      state.user = null
      state.isAuthenticated = false
      state.error = null
    },
  },
})

// Thunk to check session and update Redux store
export const checkSession = createAsyncThunk('auth/checkSession', async (_, { dispatch }) => {
  const supabase = createSupabaseClient()
  const { data: { session }, error } = await supabase.auth.getSession()

  if (error) {
    console.error('Session check error:', error)
    dispatch(setError(error.message))
    return
  }

  if (session?.user) {
    // Fetch additional user data if needed
    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (customerError) {
      console.error('Customer data error:', customerError)
      dispatch(setError(customerError.message))
      return
    }

    const userData = { ...session.user, ...customerData }
    dispatch(setUser(userData))
  } else {
    dispatch(logout())
  }
})

export const { setUser, setLoading, setError, logout } = authSlice.actions
export default authSlice.reducer 