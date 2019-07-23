'use strict';

const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const repository = require('./repository');

module.exports = (db) => {
  const rideRepo = repository(db);

  app.get('/health', (req, res) => res.send('Healthy'));

  app.post('/rides', jsonParser, async (req, res) => {
    try {
      const startLatitude = Number(req.body.start_lat);
      const startLongitude = Number(req.body.start_long);
      const endLatitude = Number(req.body.end_lat);
      const endLongitude = Number(req.body.end_long);
      const riderName = req.body.rider_name;
      const driverName = req.body.driver_name;
      const driverVehicle = req.body.driver_vehicle;

      if (startLatitude < -90 || startLatitude > 90 || startLongitude < -180 || startLongitude > 180) {
        return res.status(400).send({
          error_code: 'VALIDATION_ERROR',
          message: 'Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively'
        });
      }

      if (endLatitude < -90 || endLatitude > 90 || endLongitude < -180 || endLongitude > 180) {
        return res.status(400).send({
          error_code: 'VALIDATION_ERROR',
          message: 'End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively'
        });
      }

      if (typeof riderName !== 'string' || riderName.length < 1) {
        return res.status(400).send({
          error_code: 'VALIDATION_ERROR',
          message: 'Rider name must be a non empty string'
        });
      }

      if (typeof driverName !== 'string' || driverName.length < 1) {
        return res.status(400).send({
          error_code: 'VALIDATION_ERROR',
          message: 'Driver name must be a non empty string'
        });
      }

      if (typeof driverVehicle !== 'string' || driverVehicle.length < 1) {
        return res.status(400).send({
          error_code: 'VALIDATION_ERROR',
          message: 'Driver vehicle must be a non empty string'
        });
      }

      const rows = await rideRepo.create(req.body);

      return res.send(rows);
    } catch (error) {
      return res.status(500).send({
        error_code: 'SERVER_ERROR',
        message: 'Unknown error'
      });
    }
  });

  app.get('/rides', async (req, res) => {
    try {
      if ('page' in req.query) {
        const page = Number(req.query.page);

        if (isNaN(page) || page < 1) {
          return res.status(400).send({
            error_code: 'VALIDATION_ERROR',
            message: 'Page number must be an integer and larger than 0'
          });
        }
      }

      const rows = await rideRepo.getAll(req.query);
      if (rows.length === 0) {
        return res.status(404).send({
          error_code: 'RIDES_NOT_FOUND_ERROR',
          message: 'Could not find any rides'
        });
      }
      res.send(rows);
    } catch (error) {
      return res.status(500).send({
        error_code: 'SERVER_ERROR',
        message: 'Unknown error'
      });
    }
  });

  app.get('/rides/:id', async (req, res) => {
    try {
      const rideId = Number(req.params.id);

      if (isNaN(rideId) || rideId < 1) {
        return res.status(400).send({
          error_code: 'VALIDATION_ERROR',
          message: 'Ride ID must be an integer and larger than 0'
        });
      }

      const rows = await rideRepo.getById(req.params.id);
      if (rows.length === 0) {
        return res.status(404).send({
          error_code: 'RIDES_NOT_FOUND_ERROR',
          message: 'Could not find any rides'
        });
      }
      res.send(rows);
    } catch (error) {
      return res.status(500).send({
        error_code: 'SERVER_ERROR',
        message: 'Unknown error'
      });
    }
  });

  return app;
};
