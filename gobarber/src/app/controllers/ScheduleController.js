import Appointment from '../models/Appointment'
import User from '../models/User';
import File from '../models/File';
import { startOfDay, endOfDay, parseISO } from 'date-fns';
import { Op } from 'sequelize';

class ScheduleController {
  async index(req, res) {

    const checkUserProvider = await User.findOne({
      where: {
        id: req.userId,
        provider: true
      }
    });
    if (!checkUserProvider) {
      return res.status(401).json({ error: 'User is not a provider' });
    }

    const { page = 1, limit = 20, date } = req.query;
    const parsedDate = parseISO(date);

    const schedules = await Appointment.findAll(
      {
        where: {
          provider_id: req.userId,
          canceled_at: null,
          date: {
            [Op.between]: [startOfDay(parsedDate), endOfDay(parsedDate)],
          }
        },
        attributes: ['id', 'date'],
        order: ['date'],
        limit,
        offset: (page - 1) * limit,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email'],
            include: [{
              model: File,
              as: 'avatar',
              attributes: ['id', 'url', 'path']
            }]
          },
          {
            model: User,
            as: 'provider',
            attributes: ['id', 'name', 'email'],
            include: [{
              model: File,
              as: 'avatar',
              attributes: ['id', 'url', 'path']
            }]
          },
        ]
      }
    );

    return res.json(schedules);
  }
};




export default new ScheduleController();
