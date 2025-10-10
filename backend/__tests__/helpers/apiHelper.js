// API test helpers for making authenticated requests
const request = require('supertest');

class APIHelper {
  constructor(app) {
    this.app = app;
    this.token = null;
  }

  setToken(token) {
    this.token = token;
    return this;
  }

  get(url) {
    const req = request(this.app).get(url);
    if (this.token) {
      req.set('Authorization', `Bearer ${this.token}`);
    }
    return req;
  }

  post(url) {
    const req = request(this.app).post(url);
    if (this.token) {
      req.set('Authorization', `Bearer ${this.token}`);
    }
    return req;
  }

  put(url) {
    const req = request(this.app).put(url);
    if (this.token) {
      req.set('Authorization', `Bearer ${this.token}`);
    }
    return req;
  }

  delete(url) {
    const req = request(this.app).delete(url);
    if (this.token) {
      req.set('Authorization', `Bearer ${this.token}`);
    }
    return req;
  }
}

module.exports = APIHelper;

