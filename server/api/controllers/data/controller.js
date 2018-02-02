import DataService from '../../services/data.service';

export class Controller {
  all(req, res) {
      DataService.all(req.headers.accept, req.query)
      .then(r => res.json(r));
  }

  byId(req, res) {
      DataService
      .byId(req.headers.accept, req.params.id, req.query)
      .then(r => {
        if (r) res.json(r);
        else res.status(404).end();
      });
  }
}
export default new Controller();
