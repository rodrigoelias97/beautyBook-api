import express from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import { authRoutes } from './routes/auth-routes.js';
import { serviceRoutes } from './routes/service-routes.js';
import { businessRulesRoutes } from './routes/business-rules-routes.js';
import { availabilityRoutes } from './routes/availability-routes.js';
import { appointmentRoutes } from './routes/appointment-routes.js';
import { errorHandler } from './middleware/error-handler.js';

const app = express();
const openApiDocument = YAML.load('./docs/openapi.yaml');

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));

app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/business-rules', businessRulesRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/appointments', appointmentRoutes);

app.use((req, res) => {
  res.status(404).json({
    code: 'RESOURCE_NOT_FOUND',
    message: 'Recurso nao encontrado'
  });
});

app.use(errorHandler);

export { app };
