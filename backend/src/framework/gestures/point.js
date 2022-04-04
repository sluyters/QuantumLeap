class Point2D {
  constructor(x, y, t) {
    this.x = x;
    this.y = y;
    this.t = t;
  } 

  getCoordinates() {
    return [this.x, this.y];
  }

  setCoordinates(coordinates) {
    this.x = coordinates[0];
    this.y = coordinates[1];
  }
}

class Point3D {
  constructor(x, y, z, t) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.t = t;
  }

  getCoordinates() {
    return [this.x, this.y, this.z];
  }

  setCoordinates(coordinates) {
    this.x = coordinates[0];
    this.y = coordinates[1];
    this.z = coordinates[2];
  }
}

class PointND {
  constructor(coordinates, t) {
    this.coordinates = coordinates;
    this.t = t;
  }

  getCoordinates() {
    return this.coordinates;
  }

  setCoordinates(coordinates) {
    this.coordinates = coordinates;
  }
}

module.exports = {
  Point2D,
  Point3D,
  PointND
};