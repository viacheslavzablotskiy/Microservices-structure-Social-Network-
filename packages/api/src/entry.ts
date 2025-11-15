/// ZOD-PIPE VALIDATION MODULE
export * from './ZodPipe/ZodParserValidation'

/// AUTH STRATEGY MODULE

export * from './authStrategy/authStrategy.module' // main module
export * from './authStrategy/authJWTGuard' // handle Request - method of tha AuthGuard('jwt'), but main name of the guard is JWTAuthGuard
export * from './authStrategy/authSignJWT' // creaton of the token, have 1 log
export * from './authStrategy/authStrategy.guard' // main Strategy of the AuthGuard('jwt')

