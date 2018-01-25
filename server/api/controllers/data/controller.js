import DataService from '../../services/data.service';

export class Controller {
  all(req, res) {
      DataService.all()
      .then(r => res.json(r));
  }

  byId(req, res) {
      DataService
      .byId(req.params.id)
      .then(r => {
        if (r) res.json(r);
        else res.status(404).end();
      });
  }
}
export default new Controller();
