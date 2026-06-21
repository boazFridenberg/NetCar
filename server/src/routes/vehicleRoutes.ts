import { Router } from 'express';
import * as vehicles from '../controllers/vehicleController';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/', asyncHandler(vehicles.listVehicles));
router.get('/filters', asyncHandler(vehicles.getFilters));
router.get('/:id/image', asyncHandler(vehicles.getVehicleImage));
router.get('/:id', asyncHandler(vehicles.getVehicle));

export default router;
