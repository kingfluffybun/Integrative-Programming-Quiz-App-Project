const request = require('supertest')
const app = require('../app')

describe('Quiz API', () => {
    it('should get categories', async () => {
        const res = await request(app).get('/api/quiz/categories')
        expect(res.statusCode).toEqual(200)
        expect(res.body).toHaveProperty('success', true)
        expect(res.body).toHaveProperty('categories')
    })

    it('should get questions with valid params', async () => {
        const res = await request(app).get('/api/quiz/questions?amount=5')
        expect(res.statusCode).toEqual(200)
        expect(res.body).toHaveProperty('success', true)
        expect(res.body).toHaveProperty('results')
        expect(res.body.results).toHaveLength(5)
    })

    it('should reject invalid amount', async () => {
        const res = await request(app).get('/api/quiz/questions?amount=100')
        expect(res.statusCode).toEqual(400)
        expect(res.body).toHaveProperty('success', false)
    })
})