import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      businessId?: string
      business?: any
      role?: string
    }
  }

  interface User {
    id: string
    email: string
    businessId?: string
    business?: any
    role?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    businessId?: string
    business?: any
    role?: string
  }
}
