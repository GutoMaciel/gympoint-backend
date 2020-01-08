import { parseISO, addMonths, isBefore } from 'date-fns';
import * as Yup from 'yup';

import Enrollment from '../models/Enrollment';
import Plan from '../models/Plan';
import Student from '../models/Student';

// import Mail from '../../lib/Mail';
import Queue from '../../lib/Queue';
import EnrollmentMail from '../jobs/EnrollmentMail';

class EnrollmentController {
  async store(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number().required(),
      plan_id: Yup.number().required(),
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation Fails.' });
    }

    const { student_id, plan_id, start_date } = req.body;

    const plan = await Plan.findByPk(plan_id);

    if (!plan) {
      return res.status(400).json({ error: 'This plan does not exists.' });
    }

    const student = await Student.findByPk(student_id);

    if (!student) {
      return res.status(400).json({ error: 'Student not found.' });
    }

    const enrollmentExists = await Enrollment.findOne({
      where: {
        student_id: req.body.student_id,
        plan_id: req.body.plan_id,
      },
    });

    if (enrollmentExists) {
      return res.status(400).json({ error: 'This Enrollment already exist.' });
    }

    // end date math using datefns

    const startDate = parseISO(start_date);

    if (isBefore(startDate, new Date())) {
      return res
        .status(400)
        .json({ error: 'You can not enroll in past dates' });
    }

    // if user is active in on plan, he cannot be in another one.
    const checkStudent = await Enrollment.findOne({
      where: {
        student_id,
      },
    });

    if (checkStudent) {
      return res.status(400).json({
        error:
          'This user already has one enrollment. Update that if you want to change something.',
      });
    }

    const end_date = addMonths(startDate, plan.duration);
    // price math
    const price = plan.price * plan.duration;

    const enrollment = await Enrollment.create({
      student_id,
      plan_id,
      start_date,
      end_date,
      price,
    });

    // await Mail.sendMail({
    //   to: `${student.name} <${student.email}>`,
    //   subject: 'Wellcome to the team.',
    //   template: 'enrollment',
    //   context: {
    //     student: student.name,
    //     plan: plan.title,
    //     start_date: enrollment.start_date,
    //     end_date: enrollment.end_date,
    //     price: enrollment.price,
    //   },
    // });

    await Queue.add(EnrollmentMail.key, {
      enrollment,
      student,
      plan,
    });

    return res.json(enrollment);
  }

  async index(req, res) {
    const { page = 1 } = req.query;
    const enrollment = await Enrollment.findAll({
      where: { canceled_at: null },
      order: ['id'],
      limit: 10,
      offset: (page - 1) * 10,
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['name', 'id'],
        },
        {
          model: Plan,
          as: 'plan',
          attributes: ['title', 'id', 'price', 'duration'],
        },
      ],
      attributes: [
        'id',
        // 'student_id',
        // 'plan_id',
        'start_date',
        'end_date',
        'price',
        'active',
      ],
    });

    return res.json(enrollment);
  }

  async show(req, res) {
    const enrollmentDetail = await Enrollment.findByPk(req.params.id, {
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['name', 'id'],
        },
        {
          model: Plan,
          as: 'plan',
          attributes: ['title', 'id', 'price', 'duration'],
        },
      ],
      attributes: [
        'id',
        // 'student_id',
        // 'plan_id',
        'start_date',
        'end_date',
        'price',
        'active',
      ],
    });

    return res.json(enrollmentDetail);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number().required(),
      plan_id: Yup.number().required(),
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation Fails.' });
    }

    const { id } = req.params;

    const enrollment = await Enrollment.findByPk(id);
    if (!enrollment) {
      return res.status(400).json({ error: 'Enrollment does not exist.' });
    }

    const { student_id, plan_id, start_date } = req.body;

    const plan = await Plan.findByPk(plan_id);
    if (!plan) {
      return res.status(400).json({ error: 'This plan does not exists.' });
    }

    const student = await Student.findByPk(student_id);
    if (!student) {
      return res.status(400).json({ error: 'This student does not exists.' });
    }

    // start_date cannot be a past date.
    const startDate = parseISO(start_date);

    if (isBefore(startDate, new Date())) {
      return res
        .status(400)
        .json({ error: 'Enrollments can not be settled in past dates.' });
    }

    const end_date = addMonths(parseISO(start_date), plan.duration);

    const price = plan.price * plan.duration;

    enrollment.update({
      student_id,
      plan_id,
      start_date,
      end_date,
      price,
    });

    return res.json(enrollment);
  }

  async delete(req, res) {
    const enrollment = await Enrollment.findByPk(req.params.id);

    enrollment.canceled_at = new Date();

    await enrollment.destroy();

    return res.json();
  }
}

export default new EnrollmentController();
