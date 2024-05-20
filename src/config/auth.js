import passport from "passport" 
import { Strategy as LocalStrategy } from "passport-local" 
import GitHubStrategy from "passport-github2" 
import jwt from "jsonwebtoken" 
import User from "../dao/Models/user.model.js"
import bcrypt from "bcrypt" 
import { entorno } from "./config.js"

const initializePassport = () => {
    passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
        try {
            const user = await User.findOne({ email }) 

            if (!user) {
                return done(null, false, { message: 'Credenciales incorrectas' }) 
            }

            const validPassword = await bcrypt.compare(password, user.password) 

            if (!validPassword) {
                return done(null, false, { message: 'Credenciales incorrectas' }) 
            }

            return done(null, user) 
        } catch (error) {
            return done(error) 
        }
    })) 

    passport.use(
        "github",
        new GitHubStrategy(
            {
                clientID: entorno.CLIENT_ID,
                clientSecret: entorno.CLIENT_SECRET,
                callbackURL: entorno.CALLBACK_URL,
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    console.log(profile)
                    const user = await User.findOne({
                        email: profile._json.email,
                    }) 
                    if (!user) {
                        const newUser = {
                            first_name: profile._json.name,
                            last_name: "",
                            age: 20,
                            email: profile._json.email,
                            password: "",
                        } 
                        let createdUser = await User.create(newUser) 
                        done(null, createdUser) 
                    } else {
                        done(null, user) 
                    }
                } catch (error) {
                    return done(error) 
                }
            }
        )
    ) 

    passport.serializeUser((user, done) => {
        done(null, user._id) 
    }) 

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id) 
            done(null, user) 
        } catch (error) {
            done(error) 
        }
    }) 
} 

export const cookieExtractor = (req) => {
    let token = null 
    
    if (req && req.cookies) {
        token = req.cookies["jwtToken"] 
    }
    
    return token 
}

export const generateAuthToken = (user) => {
    const token = jwt.sign({ _id: user._id }, entorno.JWT_SECRET, { expiresIn: '1h' }) 
    return token 
} 

export const authToken = (req, res, next) => {
    const authHeader = req.headers.authorization 
    const cookieToken = req.cookies.jwtToken 
    const token = authHeader ? authHeader.split(" ")[1] : cookieToken 

    if (!token) {
        return res.status(401).send({ status: "error", message: "no autorizado" }) 
    }

    jwt.verify(token, entorno.JWT_SECRET, (error, credentials) => {
        if (error) {
            console.error('jwt error:', error) 
            return res.status(401).send({ status: "error", message: "no autorizado" }) 
        }
        req.user = credentials.user 
        next() 
    }) 
} 

export const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next()
    } else {
        return res.status(403).json({ message: 'Acceso no autorizado' })
    }
}

export const isUser = (req, res, next) => {
    if(req.user && req.user.role === 'user') {
        next()
    } 
    else {
        return res.status(403).json({ error: 'Acceso no autorizado' })
    }
}

const auth = {
    initializePassport,
    generateAuthToken
} 

export default auth 