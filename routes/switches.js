const express = require('express');
const router = express.Router();
// const switchController = require('../controllers/switchController');


const {
  getAllSwitches,
  getSwitchById,
  createSwitch,
  updateSwitch,
  deleteSwitch
} = require('../controllers/switchController');

router.get('/',getAllSwitches);
router.get('/:id', getSwitchById);
router.post('/', createSwitch);
router.put('/:id', updateSwitch);
router.delete('/:id', deleteSwitch);

// Define routes correctly:
// router.get('/', switchController.getAllSwitches);
// router.get('/:id', switchController.getSwitchById);
// router.post('/', switchController.createSwitch);
// router.put('/:id', switchController.updateSwitch);
// router.delete('/:id', switchController.deleteSwitch);

module.exports = router;
