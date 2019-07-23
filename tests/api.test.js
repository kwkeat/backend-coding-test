'use strict';

const request = require('supertest');
const sqlite3 = require('sqlite3').verbose();
const should = require('chai').should();
const assert = require('assert');
const db = new sqlite3.Database(':memory:');
const app = require('../src/app')(db);
const buildSchemas = require('../src/schemas');

describe('API tests', () => {
  before((done) => {
    db.serialize((err) => {
      if (err) {
        return done(err);
      }

      buildSchemas(db);

      done();
    });
  });

  describe('GET /health', () => {
    it('should return health', (done) => {
      request(app)
        .get('/health')
        .expect('Content-Type', /text/)
        .expect(200, done);
    });
  });

  describe('GET /rides on empty database', () => {
    it('should return RIDES_NOT_FOUND_ERROR', (done) => {
      request(app)
        .get('/rides')
        .expect(404)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            done(err);
          }
          const jsonResponse = JSON.parse(res.text);
          assert.strict.equal(jsonResponse.error_code, 'RIDES_NOT_FOUND_ERROR');
          done();
        });
    });
  });

  describe('POST /rides with empty rider name', () => {
    it('should return validation error', (done) => {
      request(app)
        .post('/rides')
        .send({
          start_lat: 1.13,
          start_long: 2.13,
          end_lat: 3.13,
          end_long: 4.13,
          rider_name: '',
          driver_name: 'UltraDriver',
          driver_vehicle: 'Sanrio'
        })
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            done(err);
          }
          const jsonResponse = JSON.parse(res.text);
          assert.strict.equal(jsonResponse.message, 'Rider name must be a non empty string');
          done();
        });
    });
  });

  describe('POST /rides with start latitude -91', () => {
    it('should return validation error', (done) => {
      request(app)
        .post('/rides')
        .send({
          start_lat: -91,
          start_long: 2.13,
          end_lat: 3.13,
          end_long: 4.13,
          rider_name: '',
          driver_name: 'UltraDriver',
          driver_vehicle: 'Sanrio'
        })
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            done(err);
          }
          const jsonResponse = JSON.parse(res.text);
          assert.strict.equal(jsonResponse.message, 'Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively');
          done();
        });
    });
  });

  describe('POST /rides', () => {
    it('should create a ride object', (done) => {
      request(app)
        .post('/rides')
        .send({
          start_lat: 1.13,
          start_long: 2.13,
          end_lat: 3.13,
          end_long: 4.13,
          rider_name: 'KamenRider',
          driver_name: 'UltraDriver',
          driver_vehicle: 'Sanrio'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            done(err);
          }
          res.body[0].should.have.property('rideID', 1);
          res.body[0].should.have.property('startLat', 1.13);
          res.body[0].should.have.property('startLong', 2.13);
          res.body[0].should.have.property('endLat', 3.13);
          res.body[0].should.have.property('endLong', 4.13);
          res.body[0].should.have.property('riderName', 'KamenRider');
          res.body[0].should.have.property('driverName', 'UltraDriver');
          res.body[0].should.have.property('driverVehicle', 'Sanrio');
          done();
        });
    });
  });

  describe('GET /rides', () => {
    it('should return array of rides', (done) => {
      request(app)
        .get('/rides')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            done(err);
          }
          res.body.should.be.a('array');
          res.body.should.have.length(1);
          res.body[0].should.be.a('object');
          res.body[0].should.have.property('rideID', 1);
          done();
        });
    });
  });

  describe('GET /rides with string', () => {
    it('should return validation error', (done) => {
      request(app)
        .get('/rides/tmd')
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            done(err);
          }
          const jsonResponse = JSON.parse(res.text);
          assert.strict.equal(jsonResponse.error_code, 'VALIDATION_ERROR');
          done();
        });
    });
  });

  describe('GET /rides on page 1', () => {
    it('should return array of rides object', (done) => {
      request(app)
        .get('/rides?page=1')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            done(err);
          }
          res.body.should.be.a('array');
          res.body.should.have.length(1);
          res.body[0].should.be.a('object');
          res.body[0].should.have.property('rideID', 1);
          done();
        });
    });
  });

  describe('GET /rides on page 2', () => {
    it('should return RIDES NOT FOUND error', (done) => {
      request(app)
        .get('/rides?page=2')
        .expect(404)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            done(err);
          }
          const jsonResponse = JSON.parse(res.text);
          assert.strict.equal(jsonResponse.error_code, 'RIDES_NOT_FOUND_ERROR');
          done();
        });
    });
  });

  describe('GET /rides/:id', () => {
    it('should return ride object of requested id', (done) => {
      request(app)
        .get('/rides/1')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            done(err);
          }
          res.body[0].should.have.property('rideID', 1);
          done();
        });
    });
  });

  describe('GET /rides/:id with string', () => {
    it('should return validation error', (done) => {
      request(app)
        .get('/rides/tmd')
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            done(err);
          }
          const jsonResponse = JSON.parse(res.text);
          assert.strict.equal(jsonResponse.error_code, 'VALIDATION_ERROR');
          done();
        });
    });
  });

  describe('GET /rides/:id with id that does not exist', () => {
    it('should return RIDES_NOT_FOUND_ERROR', (done) => {
      request(app)
        .get('/rides/2')
        .expect(404)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            done(err);
          }
          const jsonResponse = JSON.parse(res.text);
          assert.strict.equal(jsonResponse.error_code, 'RIDES_NOT_FOUND_ERROR');
          done();
        });
    });
  });
});
