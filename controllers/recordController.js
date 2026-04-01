const RecordService = require('../services/recordService');
const { validationResult } = require('express-validator');

class RecordController {
  static async create(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const record = await RecordService.create(req.body, req.user.id);
      res.status(201).json(record);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getAll(req, res) {
    try {
      const { type, category, startDate, endDate, limit, offset } = req.query;
      const records = await RecordService.getAll({ 
        type, category, startDate, endDate, limit, offset 
      });
      res.status(200).json(records);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const record = await RecordService.getById(req.params.id);
      res.status(200).json(record);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const record = await RecordService.update(req.params.id, req.body);
      res.status(200).json(record);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      await RecordService.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = RecordController;
