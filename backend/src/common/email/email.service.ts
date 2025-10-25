import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailService } from '@sendgrid/mail';

@Injectable()
export class EmailService {
  private sgMail: MailService;
  private apiKey: string;
  private fromEmail: string;
  private fromName: string;
  private frontendUrl: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.getOrThrow('SENDGRID_API_KEY');
    this.fromEmail = this.configService.getOrThrow('SENDGRID_FROM_EMAIL');
    this.fromName = this.configService.getOrThrow('SENDGRID_FROM_NAME');
    this.frontendUrl = this.configService.getOrThrow('FRONTEND_URL');
    this.sgMail = new MailService();
    this.sgMail.setApiKey(this.apiKey);
  }

  async sendTemporaryPassword(
    email: string,
    tempPassword: string,
  ): Promise<void> {
    const msg = {
      to: email,
      from: {
        email: this.fromEmail,
        name: this.fromName,
      },
      subject: 'Mật khẩu tạm thời - Tutorize',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">📚 Tutorize</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
            <h2 style="color: #495057; margin-top: 0;">Mật khẩu tạm thời của bạn</h2>
            
            <p style="color: #6c757d; font-size: 16px; line-height: 1.6;">
              Chúng tôi đã tạo một mật khẩu tạm thời cho tài khoản của bạn theo yêu cầu khôi phục mật khẩu.
            </p>
            
            <div style="background: white; border: 2px solid #28a745; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
              <p style="margin: 0; color: #495057; font-size: 14px; margin-bottom: 10px;">Mật khẩu tạm thời:</p>
              <h3 style="margin: 0; color: #28a745; font-family: 'Courier New', monospace; font-size: 20px; letter-spacing: 2px;">
                ${tempPassword}
              </h3>
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #856404; font-size: 14px;">
                <strong>⚠️ Lưu ý quan trọng:</strong>
              </p>
              <ul style="color: #856404; font-size: 14px; margin: 10px 0; padding-left: 20px;">
                <li>Vui lòng đăng nhập và đổi mật khẩu ngay lập tức</li>
                <li>Mật khẩu này chỉ dành cho lần đăng nhập đầu tiên</li>
                <li>Để bảo mật tài khoản, hãy tạo mật khẩu mới mạnh và duy nhất</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${this.frontendUrl}/login" 
                 style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                Đăng nhập ngay
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
            
            <p style="color: #6c757d; font-size: 12px; text-align: center; margin: 0;">
              Nếu bạn không yêu cầu khôi phục mật khẩu, vui lòng bỏ qua email này.<br>
              Email này được gửi tự động, vui lòng không trả lời.
            </p>
          </div>
        </div>
      `,
    };

    try {
      await this.sgMail.send(msg);
    } catch (error) {
      console.error('❌ SendGrid Error (Temporary Password):', error);
      throw new Error('Failed to send email via SendGrid');
    }
  }

  async sendPasswordChangeNotification(
    email: string,
    firstName?: string,
  ): Promise<void> {
    const msg = {
      to: email,
      from: {
        email: this.fromEmail,
        name: this.fromName,
      },
      subject: 'Mật khẩu đã được thay đổi - Tutorize',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">📚 Tutorize</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
            <h2 style="color: #495057; margin-top: 0;">Mật khẩu đã được thay đổi thành công</h2>
            
            <p style="color: #6c757d; font-size: 16px; line-height: 1.6;">
              ${firstName ? `Xin chào ${firstName},` : 'Xin chào,'}
            </p>
            
            <p style="color: #6c757d; font-size: 16px; line-height: 1.6;">
              Mật khẩu cho tài khoản của bạn đã được thay đổi thành công vào lúc ${new Date().toLocaleString(
                'vi-VN',
                {
                  timeZone: 'Asia/Ho_Chi_Minh',
                  hour12: false,
                },
              )}.
            </p>
            
            <div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #155724; font-size: 14px;">
                <strong>✅ Bảo mật tài khoản:</strong> Mật khẩu của bạn đã được cập nhật thành công.
              </p>
            </div>
            
            <div style="background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #721c24; font-size: 14px;">
                <strong>⚠️ Quan trọng:</strong> Nếu bạn không thực hiện thay đổi này, vui lòng liên hệ với chúng tôi ngay lập tức để bảo vệ tài khoản.
              </p>
            </div>
            
            <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
            
            <p style="color: #6c757d; font-size: 12px; text-align: center; margin: 0;">
              Email này được gửi tự động, vui lòng không trả lời.<br>
              © 2025 Tutorize. Tất cả quyền được bảo lưu.
            </p>
          </div>
        </div>
      `,
    };

    try {
      await this.sgMail.send(msg);
    } catch (error) {
      console.error('❌ SendGrid Error (Password Change Notification):', error);
    }
  }

  async sendWelcomeEmail(email: string, firstName: string): Promise<void> {
    const msg = {
      to: email,
      from: {
        email: this.fromEmail,
        name: this.fromName,
      },
      subject: 'Chào mừng bạn đến với Tutorize! 🎉',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">📚 Tutorize</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
            <h2 style="color: #495057; margin-top: 0;">Chào mừng ${firstName}! 🎉</h2>
            
            <p style="color: #6c757d; font-size: 16px; line-height: 1.6;">
              Cảm ơn bạn đã đăng ký tài khoản Tutorize! Chúng tôi rất vui mừng được đồng hành cùng bạn trong hành trình học tập.
            </p>
            
            <div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #155724; font-size: 14px;">
                <strong>✅ Tài khoản đã được tạo thành công!</strong>
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${this.frontendUrl}/quiz" 
                 style="background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                Bắt đầu học ngay
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
            
            <p style="color: #6c757d; font-size: 12px; text-align: center; margin: 0;">
              Email này được gửi tự động, vui lòng không trả lời.<br>
              © 2025 Tutorize. Tất cả quyền được bảo lưu.
            </p>
          </div>
        </div>
      `,
    };

    try {
      await this.sgMail.send(msg);
    } catch (error) {
      console.error('❌ SendGrid Error (Welcome Email):', error);
    }
  }
}
