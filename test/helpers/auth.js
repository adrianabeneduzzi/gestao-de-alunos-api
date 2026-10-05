import request from 'supertest';
import app from '../../src/app.js';

export async function loginAdmin() {
    const resposta = await request(app)
        .post('/api/auth/login')
        .send({
            email: 'admin@escola.com',
            senha: 'admin123'
        });

    return resposta.body.token;
}

export async function loginUser(email, senha) {
    const resposta = await request(app)
        .post('/api/auth/login')
        .send({
            email,
            senha
        });

    return resposta.body.token;
}
