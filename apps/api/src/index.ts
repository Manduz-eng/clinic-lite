import { app } from './server';
import { env } from './config/env';

const PORT = env.PORT;

app.listen(PORT, () => {
  console.log(`Clinic-Lite API running on port ${PORT}`);
  console.log(`Environment: ${env.NODE_ENV}`);
});
