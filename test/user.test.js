import { expect } from "chai"
import supertest from "supertest"
import mongoose from "mongoose"
import User from "../src/dao/models/user.model.js"
import { entorno } from "../src/config/config.js"

const requester = supertest("http://localhost:8080")

describe("User Tests", function () {
    let userId
    let authToken
    const userMock = {
        first_name: 'prueba',
        last_name: 'prueba01',
        email: 'prueba01@prueba02.com',
        age: 40,
        password: '123456',
        role: 'premium'
    }
    const updateUser = {
        first_name: "prueba",
        last_name: "prueba01",
        email: "prueba01@prueba02.com"
    }

    before(async function () {
        await mongoose.connect(entorno.MONGO_URL)
    })

    beforeEach(async function () {
        const existingUser = await User.findOne({ email: userMock.email })
        if (existingUser) {
            console.log("Usuario ya existe, procediendo con el login.")
            const loginResponse = await requester.post("/api/sessions/login").send({
                email: userMock.email,
                password: userMock.password
            })
            expect(loginResponse.statusCode).to.equal(200)
            console.log("Login exitoso:", loginResponse.body)
            authToken = loginResponse.body.access_token
            userId = existingUser._id.toString()
        } else {
            const registerResponse = await requester.post("/api/sessions/register").send(userMock)
            expect(registerResponse.statusCode).to.equal(200)
            console.log("Registro exisoso:", registerResponse.body)
            userId = registerResponse.body.message._id
            authToken = registerResponse.body.access_token
        }
    })

    describe("User Update Test", () => {
        it("should update user details", async function () {
            const updatedUser = await requester
                .put(`/api/sessions/updateUser/${userId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateUser)
            expect(updatedUser.statusCode).to.equal(200)
            expect(updatedUser.ok).to.be.true
            expect(updatedUser.body).to.have.property('first_name', updateUser.first_name)
            expect(updatedUser.body).to.have.property('email', updateUser.email)
            console.log("Usuario actualizado:", updatedUser._body)
        })
    })

    after(async function () {
        await User.deleteMany({ first_name: "New test" })
        await mongoose.disconnect()
    })
})
