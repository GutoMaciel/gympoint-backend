import * as Yup from 'yup';
import HelpOrders from '../models/HelpOrders';
import Student from '../models/Student';

class HelpOrdersController {
  // list all questions without answers:

  async index(req, res) {
    const { page = 1, perPage = 10 } = req.query;

    const helpOrder = await HelpOrders.findAndCountAll({
      where: {
        answer_at: null,
      },
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name'],
        },
      ],
      order: ['created_at'],
      limite: perPage,
      offset: (page - 1) * perPage,
    });

    return res.json(helpOrder);
  }

  //   const { id } = req.params;

  //   const student = await Student.findByPk(id);
  //   if (!student) {
  //     return res.status(400).json({ error: 'Student not found.' });
  //   }
  //   const helpOrders = await HelpOrders.findAll({
  //     where: {
  //       student_id: id,
  //     },
  //     order: ['id'],
  //   });

  //   return res.json(helpOrders);
  // }

  // subscript help orders by student:

  async show(req, res) {
    const { id } = req.params;

    const questions = await HelpOrders.findAll({
      where: {
        student_id: id,
      },
      order: [
        ['answer_at', 'desc'],
        ['created_at', 'desc'],
      ],
      limit: 10,
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name'],
        },
      ],
    });

    return res.json(questions);

    // const question = await HelpOrders.findByPk(req.params.id, {
    //   include: [
    //     {
    //       model: Student,
    //       as: 'student',
    //       attributes: ['id', 'name'],
    //     },
    //   ],
    //   attributes: ['id', 'question', 'answer', 'created_at', 'answer_at'],
    // });

    // return res.json(question);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      question: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation Fails.' });
    }

    const student = await Student.findByPk(req.params.id);
    if (!student) {
      return res.status(400).json({ error: 'Student not found.' });
    }

    const { question } = req.body;

    const helpOrders = await HelpOrders.create({
      student_id: req.params.id,
      question,
    });

    return res.json(helpOrders);
  }

  // Answer the question:

  async update(req, res) {
    const schema = Yup.object().shape({
      answer: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation Fails.' });
    }

    const { id } = req.params;

    const helpOrders = await HelpOrders.findByPk(id);
    if (!helpOrders) {
      return res.status(400).json({ error: 'Question not found.' });
    }

    const { answer } = req.body;

    const answer_at = new Date();

    helpOrders.update({
      answer,
      answer_at,
    });

    return res.json(helpOrders);
  }
}

export default new HelpOrdersController();
