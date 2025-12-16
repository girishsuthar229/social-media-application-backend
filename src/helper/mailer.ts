import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';

dotenv.config();

export class Mailer {
  private static transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    tls: {
      rejectUnauthorized: false,
    },
    logger: true,
  });

  static async sendMail(to: string, subject?: string, html?: string) {
    await this.transporter.sendMail({
      from: `"Linking You to the World" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
  }
}
