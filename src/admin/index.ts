import express from 'express';
import basicAuth from 'express-basic-auth';
import ConfigRepository from '../ConfigRepository';
import Upstreams from './Upstreams';

export default class Admin {
  protected app: express.Express;

  public constructor(
    protected config: ConfigRepository,
  ) {
    this.app = express();
    this.createApp();
  }

  protected createApp() {
    this.app = express();
    const access = this.config.getAdminAccess();
    const users: { [key: string]: string } = {};
    users[access.username] = access.password;
    this.app.use(basicAuth({ users, challenge: true }));

    this.app.use('/minio-gateway/admin', this.adminRoute());
  }

  protected adminRoute() {
    const router = express.Router();

    const upstreams = new Upstreams(this.config);
    router.use('/upstreams', upstreams.getRoutes());

    return router;
  }

  public getApp() {
    return this.app;
  }
}
