require('dotenv').config();

const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');
const { redis, close } = require('../redis');
const app = require('../app');

chai.use(chaiHttp);

function redisSet(key, value) {
    return new Promise((resolve, reject) => {
        redis.set(key, value, err => {
            if (err) {
                return reject();
            }

            resolve();
        });
    });
}

describe('tests', () => {

    after(() => {
        close();
    });

    it('should return value', async () => {
        await redisSet('value', 'testvalue');
        const res = await chai.request(app)
            .get('/api/value')
            .send();

        expect(res.status).to.be.equal(200);
        expect(JSON.parse(res.text).value).to.be.equal('testvalue');
    });
});