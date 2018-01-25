import sensorsRouter from './api/controllers/sensors/router';
import dataRouter from './api/controllers/data/router';

export default function routes(app) {
  app.use('/api/v1/sensors', sensorsRouter);
  app.use('/api/v1/data', dataRouter);
}
