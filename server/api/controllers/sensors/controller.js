import SensorsService from '../../services/sensors.service';

export class Controller {
  all(req, res) {
      SensorsService.all(req.headers.accept, req.query)
      .then(r => res.json(r));
  }

  byId(req, res) {
      SensorsService
      .byId(req.headers.accept, req.params.id)
      .then(r => {
        if (r) res.json(r);
        else res.status(404).end();
      });
  }
}
export default new Controller();
