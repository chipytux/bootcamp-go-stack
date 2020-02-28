import { isBefore, parseISO, startOfHour } from 'date-fns';
import * as Yup from 'yup';
import Appointment from '../models/Appointment';
import User from '../models/User';
import File from '../models/File';


class AppointmentController {

  async index(req, res) {
    const { page = 1, limit = 20 } = req.query;

    const appointments = await Appointment.findAll({
      where: { user_id: req.userId, canceled_at: null },
      order: ['date'],
      attributes: ['id', 'date'],
      limit,
      offset: (page - 1) * limit,
      include: [{
        model: User, as: 'provider',
        attributes: ['id', 'name']
      }, {
        model: User, as: 'user',
        attributes: ['id', 'name'],
        include: [{
          model: File,
          as: 'avatar',
          attributes: ['id', 'url', 'path']
        }]
      }]
    });

    return res.json(appointments);
  }

  async store(req, res) {
    console.log(req.userId);
    const schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required(),
      user_id: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { provider_id, date } = req.body;

    /*
    * Check if  provider_id is a provider
    */
    const isProvider = await User.findOne({ where: { id: provider_id, provider: true } })
    if (!isProvider) {
      return res.status(400).json({ error: 'You can only create appointments with providers' });
    }

    /*
    * Check for past dates
    */
    const hourStart = startOfHour(parseISO(date));
    if (isBefore(hourStart, new Date())) {
      return res.status(400).json({ error: 'Past dates are not permited' });
    }

    /*
    * Check date avallability
    */
    const checkAvalability = await Appointment.findOne({
      where: {
        provider_id,
        canceled_at: null,
        date: hourStart,
      }
    });

    if (checkAvalability) {
      return res.status(400).json({ error: 'Appointment date is not available' });
    }

    const appointment = await Appointment.create({ user_id: req.userId, provider_id, date: hourStart });
    return res.json(appointment);
  }
}

export default new AppointmentController();
