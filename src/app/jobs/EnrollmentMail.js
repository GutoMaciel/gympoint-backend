import Mail from '../../lib/Mail';

class EnrollmentMail {
  get key() {
    return 'EnrollmentMail';
  }

  async handle({ data }) {
    const { enrollment, student, plan } = data;

    await Mail.sendMail({
      to: `${student.name} <${student.email}>`,
      subject: 'Wellcome to the team.',
      template: 'enrollment',
      context: {
        student: student.name,
        plan: plan.title,
        start_date: enrollment.start_date,
        end_date: enrollment.end_date,
        price: enrollment.price,
      },
    });
  }
}

export default new EnrollmentMail();
