import * as Yup from 'yup';
import { Op } from 'sequelize';
import Student from '../models/Student';

class StudentController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      age: Yup.number().required(),
      weight: Yup.number().required(),
      height: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation Fail' });
    }

    const studentExists = await Student.findOne({
      where: { email: req.body.email },
    });

    if (studentExists) {
      return res.status(400).json({ error: 'Student already exists.' });
    }

    const { id, name, email, age, height, weight } = await Student.create(
      req.body
    );

    return res.json({
      id,
      name,
      email,
      age,
      height,
      weight,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      age: Yup.number(),
      weight: Yup.number(),
      height: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fail.' });
    }
    const { email } = req.body;

    const student = await Student.findByPk(req.params.id);

    if (!student) {
      return res.status(400).json({ error: 'Student does not exists.' });
    }

    if (email !== student.email) {
      const studentExists = await Student.findOne({
        where: { email },
      });

      if (studentExists) {
        return res.status(400).json({ error: 'Email already taken.' });
      }
    }

    const { name, age, weight, height } = await student.update(req.body);

    return res.json({
      name,
      email,
      age,
      weight,
      height,
    });
  }

  async index(req, res) {
    const { name } = req.query;
    const { page = 1 } = req.query;

    if (name) {
      const student = await Student.findAndCountAll({
        where: {
          name: { [Op.iLike]: `%${name}%` },
        },
        limit: 15,
        order: ['id'],
        offset: (page - 1) * 10,
      });

      if (!student) {
        return res.status(400).json({ error: 'Student not found.' });
      }

      return res.json(student);
    }

    const students = await Student.findAndCountAll({
      order: ['name'],
      limit: 15,
      offset: (page - 1) * 10,
    });

    return res.json(students);
  }

  async show(req, res) {
    const studentDetail = await Student.findByPk(req.params.id, {
      attributes: ['id', 'name', 'email', 'age', 'weight', 'height'],
    });

    return res.json(studentDetail);
  }

  async delete(req, res) {
    const student = await Student.findByPk(req.params.id);

    await student.destroy();

    return res.json();
  }
}

export default new StudentController();
