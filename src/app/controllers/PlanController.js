import * as Yup from 'yup';
import Plan from '../models/Plan';

class PlanController {
  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      duration: Yup.number().required(),
      price: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation Fails' });
    }

    const planExists = await Plan.findOne({
      where: {
        title: req.body.title,
        duration: req.body.duration,
        price: req.body.price,
      },
    });

    if (planExists) {
      return res.status(400).json({ error: 'This plan already exist.' });
    }

    const { id, title, price, duration } = await Plan.create(req.body);

    return res.json({
      id,
      title,
      price,
      duration,
    });
  }

  async index(req, res) {
    const plan = await Plan.findAll({
      order: ['id'],
      attributes: ['id', 'title', 'price', 'duration'],
    });

    return res.json(plan);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string(),
      duration: Yup.number(),
      price: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation Fails' });
    }

    const plan = await Plan.findByPk(req.params.id);

    if (!plan) {
      return res.status(400).json({ error: 'This plan does not exist.' });
    }

    const planExists = await Plan.findOne({
      where: {
        title: req.body.title,
        duration: req.body.duration,
        price: req.body.price,
      },
    });

    if (planExists) {
      return res.status(400).json({ error: 'This plan already exists.' });
    }

    const { title, price, duration } = await plan.update(req.body);

    return res.json({
      title,
      price,
      duration,
    });
  }

  async delete(req, res) {
    const plan = await Plan.findByPk(req.params.id);

    await plan.destroy();

    return res.json();
  }
}

export default new PlanController();
