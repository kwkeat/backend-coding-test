module.exports = (db) => {
  const create = (params) => {
    return new Promise((resolve, reject) => {
      const values = [params.start_lat, params.start_long, params.end_lat, params.end_long, params.rider_name, params.driver_name, params.driver_vehicle];
      db.run('INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)', values, function (err) {
        if (err) {
          reject(err);
        }

        db.all('SELECT * FROM Rides WHERE rideID = ?', this.lastID, function (err, rows) {
          if (err) {
            reject(err);
          }

          resolve(rows);
        });
      });
    });
  };

  const getAll = (params) => {
    let { page } = params;
    page = page || 1;
    const lowerLimit = (page - 1) * 5;

    const query = `SELECT * FROM Rides WHERE rideID > ${lowerLimit} ORDER BY rideID LIMIT 5`;

    return new Promise((resolve, reject) => {
      db.all(query, (error, rows) => {
        if (error) {
          reject(error);
        }

        resolve(rows);
      });
    });
  };

  const getById = (id) => {
    return new Promise((resolve, reject) => {
      db.all(`SELECT * FROM Rides WHERE rideID='${id}'`, function (err, rows) {
        if (err) {
          reject(err);
        };

        resolve(rows);
      });
    });
  };

  return {
    create,
    getAll,
    getById
  };
};
