import express from 'express';
import ConfigRepository from '../ConfigRepository';
import ContainerHelper from '../ContainerHelper';
import Upstream from '../Upstream';

export default class Upstreams {
  public constructor(protected config: ConfigRepository) {

  }

  public search(req: express.Request, res: express.Response) {
    res.json({
      status: true,
      slaves: ContainerHelper.getSalves().map((upstream) => upstream.toJson()),
      minio: ContainerHelper.getMinio().toJson(),
      master: ContainerHelper.getMaster()?.toJson(),
    });
  }

  public getOne(req: express.Request, res: express.Response) {
    const upstream = this.findUpstream(req, res);
    if (upstream === undefined) {
      return;
    }
    res.json({
      status: true,
      upstream: upstream.toJson(),
    });
  }

  public reset(req: express.Request, res: express.Response) {
    const upstream = this.findUpstream(req, res);
    if (upstream === undefined) {
      return;
    }
    upstream.reset();
    res.json({
      status: true,
      upstream: upstream.toJson(),
    });
  }

  public resetAll(req: express.Request, res: express.Response) {
    res.json({
      status: true,
      upstreams: ContainerHelper.getUpstreams(true).map((upstream) => {
        upstream.reset();
        return upstream.toJson();
      }),
    });
  }

  public getRoutes(): express.Router {
    const router = express.Router();
    router.get('/', this.search.bind(this));
    router.get('/:upstream', this.getOne.bind(this));
    router.post('/:upstream/reset', this.reset.bind(this));
    router.post('/reset', this.resetAll.bind(this));

    return router;
  }

  private findUpstream(req: express.Request, res: express.Response): Upstream | undefined {
    if (!req.params.upstream) {
      res.status(404).json({
        status: false,
        error: 'notfound',
      });

      return undefined;
    }
    const upstream = ContainerHelper.getUpstreams(true).find((item) => item.getURL().hostname === req.params.upstream);
    if (upstream === undefined) {
      res.status(404).json({
        status: false,
        error: 'notfound',
      });

      return undefined;
    }

    return upstream;
  }
}
