import { Injectable } from '@nestjs/common';
import { MailerService as NestMailerService } from '@nestjs-modules/mailer';
import { Users } from '../users/entity/user.entity';

@Injectable()
export class MailerService {
  constructor(private readonly mailerService: NestMailerService) {}

  async sendMail(to: string, subject: string, html: string): Promise<void> {
    try {
      const info = await this.mailerService.sendMail({
        from: `"Linking You to the World" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
      });
      console.log('Email sent: ', info.response);
    } catch (error) {
      console.error('Error sending email: ', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  async sendPasswordResetEmail(to: string, resetToken: string): Promise<void> {
    const resetLink = `https://social-media-application-frontend.onrender.com/set-password?token=${resetToken}`;
    const subject = 'Password Reset Request';
    const htmlMessage = `
      <p>Hi,</p>
      <p>We received a request to reset your password. Please click the link below to reset it:</p>
      <p><a href="${resetLink}">Reset your password</a></p>
      <p>If you did not request a password reset, please ignore this email.</p>
    `;
    await this.sendMail(to, subject, htmlMessage);
  }

  async sendVerificationEmail(
    user: Users,
    email: string,
    generatedOTP: string,
    expiresIn: string,
  ) {
    const subject = 'Your Password Reset Verification Code';
    const htmlMessage = `
      <p>Dear ${user.first_name ? user.first_name + ' ' + user.last_name : user?.user_name},</p>
      <p>You have requested to reset your password.<br>Your verification code is: <strong>${generatedOTP}</strong></p>
      <p>This code is valid for <strong>${expiresIn}</strong> only. For security reasons, please do not share this code with anyone.</p>
      <p>Thank you</p>
    `;
    await this.sendMail(email, subject, htmlMessage);
  }
}
