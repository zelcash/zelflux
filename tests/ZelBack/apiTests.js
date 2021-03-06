process.env.NODE_CONFIG_DIR = `${process.cwd()}/ZelBack/config/`;
const request = require('supertest');
const config = require('config');
const chai = require('chai');
const expect = chai.expect;
const app = require('../../ZelBack/src/lib/server.js');
const log = require('../../ZelBack/src/lib/log');
const packageJson = require('../../package.json');
const { version } = packageJson;

const server = app.listen(config.server.apiport, () => {
  log.info(`Flux listening on port ${config.server.apiport}!`);
});

describe('loading express', function () {
  after(function (done) {
    server.close(done);
    setTimeout(() => {
      process.exit();
    }, 10000);
  });
  before(async () => {
    const serviceHelper = require('../../ZelBack/src/services/serviceHelper');
    await serviceHelper.initiateDB();
  });
  it('/flux/version', function testSlash(done) {
    request(server)
      .get('/flux/version')
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(JSON.parse(res.text).data).to.be.equal(version);
        return done();
      });
  });
  it('non-existing-path', function testPath(done) {
    request(server)
      .get('/foo/bar')
      .expect(404, done);
  });
  it('/id/loginphrase', function testSlash(done) {
    request(server)
      .get('/id/loginphrase')
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(JSON.parse(res.text).status).to.be.equal('success');
        expect(JSON.parse(res.text).data.charAt(0)).to.be.equal('1');
        return done();
      });
  });
});