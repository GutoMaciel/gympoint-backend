// import * as Yup from 'yup';
import HelpOrders from '../models/HelpOrders';
import Student from '../models/Student';

class AnswerController {
  async show(req, res) {
    const question = await HelpOrders.findByPk(req.params.id, {
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name'],
        },
      ],
      attributes: ['id', 'question', 'answer', 'created_at', 'answer_at'],
    });

    return res.json(question);
  }
}
export default new AnswerController();
