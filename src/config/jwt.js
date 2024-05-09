import passport from "passport" 
import passportJWT from "passport-jwt" 
import { entorno } from "./config.js"
import { cookieExtractor } from "./auth.js"

const ExtractJWT = passportJWT.ExtractJwt 
const JwtStrategy = passportJWT.Strategy 

const jwtOptions = {
    jwtFromRequest: ExtractJWT.fromExtractors([cookieExtractor]),
    secretOrKey: entorno.JWT_SECRET,
} 

const strategy = new JwtStrategy(jwtOptions, async (jwt_payload, done) => {
    try {
        if (jwt_payload) {
            return done(null, jwt_payload) 
        } else {
            return done(null, false) 
        }
    } catch (error) {
        console.error('Error en jwt: ', error) 
        return done(error, false) 
    }
}) 

passport.use(strategy) 

export default passport 

