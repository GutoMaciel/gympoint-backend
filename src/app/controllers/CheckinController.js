import { startOfWeek, endOfWeek } from 'date-fns';
import { Op } from 'sequelize';
import Student from '../models/Student';
import Checkin from '../models/Checkin';

class CheckinController {
  async index(req, res) {
    const { id } = req.params;

    const checkin = await Checkin.findAll({
      where: {
        student_id: id,
      },
      order: [['created_at', 'desc']],
      limit: 15,
    });

    return res.json(checkin);
  }

  async store(req, res) {
    const student = await Student.findByPk(req.params.id);
    if (!student) {
      return res.status(400).json({ error: 'Student does not exists.' });
    }

    const date = new Date();
    const weekStart = startOfWeek(date);
    const weekEnd = endOfWeek(date);

    const checkinCount = await Checkin.count({
      where: {
        student_id: req.params.id,
        created_at: {
          [Op.between]: [weekStart, weekEnd],
        },
      },
    });

    if (checkinCount > 5) {
      return res.status(401).json({
        error: 'You reached the 5 limit checkins in the last 7 days.',
      });
    }

    const checkin = await Checkin.create({
      student_id: req.params.id,
    });

    return res.json(checkin);
  }
}

export default new CheckinController();
