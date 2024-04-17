import passport from "passport" 
import { Strategy as LocalStrategy } from "passport-local" 
import GitHubStrategy from "passport-github2" 
import jwt from "jsonwebtoken" 
import User from "../dao/models/user.js" 
import config from "./config.js" 
import bcrypt from "bcrypt" 

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
                clientID: "Iv1.fc74e10587c7cef5",
                clientSecret: "31fbe384d572ee0106659367c2ca266486a95a83",
                callbackURL: "http://localhost:8080/api/sessions/githubcallback",
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

const generateAuthToken = (user) => {
    const token = jwt.sign({ _id: user._id }, config.jwtSecret, { expiresIn: '1h' }) 
    return token 
} 

const auth = {
    initializePassport,
    generateAuthToken
} 

export default auth 