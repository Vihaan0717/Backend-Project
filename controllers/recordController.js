const RecordService = require('../services/recordService');
const asyncHandler = require('../middleware/asyncHandler');

class RecordController {
  static create = asyncHandler(async (req, res) => {
    const record = await RecordService.create(req.body, req.user.id);
    res.status(201).json({
      status: 'success',
      message: 'Financial record created successfully',
      data: record
    });
  });

  static getAll = asyncHandler(async (req, res) => {
    const records = await RecordService.getAll(req.query);
    res.status(200).json({
      status: 'success',
      ...records
    });
  });

  static getById = asyncHandler(async (req, res) => {
    const record = await RecordService.getById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: record
    });
  });

  static update = asyncHandler(async (req, res) => {
    const record = await RecordService.update(req.params.id, req.body);
    res.status(200).json({
      status: 'success',
      message: 'Financial record updated successfully',
      data: record
    });
  });

  static delete = asyncHandler(async (req, res) => {
    await RecordService.delete(req.params.id);
    res.status(200).json({
      status: 'success',
      message: 'Financial record deleted successfully'
    });
  });
}

module.exports = RecordController;
