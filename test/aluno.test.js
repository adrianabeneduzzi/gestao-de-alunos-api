import request from 'supertest';
import { expect } from 'chai';
import app from '../src/app.js';
import { loginAdmin, loginUser } from './helpers/auth.js';
import alunos from './data/alunos.json' with { type: 'json' };

describe('Fluxo de cadastro e entrega de trabalho', () => {
    let adminToken;
    let alunoId;
    let alunoToken;
    let disciplinaId;

    before(async () => {
        adminToken = await loginAdmin();
    });

    it('deve cadastrar o aluno usando dados do JSON', async () => {
        for (const aluno of alunos) {
            const resposta = await request(app)
                .post('/api/admin/alunos')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(aluno);

            expect(resposta.status).to.equal(201);
            expect(resposta.body).to.have.property('id');

            alunoId = resposta.body.id;
        }
    });

    it('deve criar uma disciplina e matricular o aluno', async () => {
        const disciplina = await request(app)
            .post('/api/admin/disciplinas')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                nome: 'Automação de Testes',
                codigo: 'QA001',
                cargaHoraria: 40
            });

        expect(disciplina.status).to.equal(201);
        expect(disciplina.body).to.have.property('id');

        disciplinaId = disciplina.body.id;

        const matricula = await request(app)
            .post(`/api/admin/disciplinas/${disciplinaId}/matriculas`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ alunoId });

        expect(matricula.status).to.equal(201);
    });

    it('deve fazer login como aluno', async () => {
        alunoToken = await loginUser();

        expect(alunoToken).to.be.a('string');
        expect(alunoToken).to.not.be.empty;
    });

    it('deve registrar um trabalho como aluno', async () => {
        const resposta = await request(app)
            .post(`/api/alunos/${alunoId}/trabalhos`)
            .set('Authorization', `Bearer ${alunoToken}`)
            .send({
                disciplinaId,
                titulo: 'Trabalho de Automação',
                descricao: 'Trabalho realizado para avaliação.'
            });

        expect(resposta.status).to.equal(201);
        expect(resposta.body).to.have.property('id');
        expect(resposta.body.alunoId).to.equal(alunoId);
        expect(resposta.body.disciplinaId).to.equal(disciplinaId);
    });
});