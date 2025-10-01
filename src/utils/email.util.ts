import * as nodemailer from 'nodemailer';

export class EmailUtil {
  private static transporter;

  private static getTransporter() {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    }
    return this.transporter;
  }

  static async sendMail(to: string, subject: string, html: string) {
    try {
      const transporter = this.getTransporter();
      await transporter.sendMail({
        from: `"Portraits for Patriots" <${process.env.SMTP_FROM}>`,
        to,
        subject,
        html,
      });
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  }

  static async sendOnboardingEmail(to: string, name: string) {
    try {
      const transporter = this.getTransporter();
      const subject = 'Welcome to Portraits For Patriots®';
      const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; font-size: 15px; color: #333;">
          <p>${name},</p>

          <p>Welcome to Portraits For Patriots®. We’re grateful you’ve chosen to volunteer your time and talent to support our mission.</p>
  
          <p>As a national non-profit organization, we’ve had the privilege of serving thousands of transitioning service members and their families with a professional portrait. 
          Each one is a gesture of dignity, respect, and support during a pivotal chapter of their lives. Thanks to volunteers like you, we’re able to meet this need with excellence and care.</p>
  
          <p>To get started, we ask that you complete two brief steps:</p>
          <ol>
            <li><a href="https://app.portraitsforpatriots.org/onboarding" target="_blank">Fill out the onboarding form</a> so we can gather the details we need to set you up in our system.</li>
            <li><a href="https://calendly.com/ericstegall/portraiteer" target="_blank">Schedule a quick call</a> with our founder, Eric Stegall, so we can connect and make sure you're ready to begin accepting referrals.</li>
          </ol>
  
          <p>Once both are complete, we’ll activate your profile in our referral system and you’ll be eligible to begin accepting assignments in your area.</p>
  
          <p>All we ask of our Portraiteers™ is that you provide each participant with one final image, your best work, ready for LinkedIn or similar professional use. 
          For many transitioning service members, this portrait is the first time they’ve seen themselves without their identity on their shoulder. It’s more than a headshot. 
          It’s a reflection of who they are becoming and a reminder that their story continues beyond the uniform.</p>
  
          <p>One last thing. In this increasingly divisive political environment, many would have us believe one side or the other has a monopoly on what defines patriotism. 
          We use Merriam-Webster’s definition. Nothing more, nothing less:</p>
  
          <blockquote style="margin: 10px 0; padding: 10px; border-left: 3px solid #2c3e50; background: #f9f9f9;">
            <p style="margin: 0;">
              <strong>patriotism</strong> [noun]<br/>
              pa·tri·ot·ism (ˈpā-trē-ə-ˌti-zəm): love for or devotion to one’s country
            </p>
          </blockquote>
  
          <p>Portraits For Patriots® is a non-political, military family support and education program. We are dedicated to empowering service members, military spouses, and Gold Star families 
          through photography and professional development—without ties to any political party, administration, or ideology.</p>
  
          <p>We’re glad you’re here, and we’re looking forward to seeing the impact you’ll make.</p>
  
          <p>
            Gratefully,<br/>
            Sarah Firth<br/>
            Director of Programs<br/>
            Portraits For Patriots®
          </p>
        </div>
      `;
      await transporter.sendMail({
        from: `"Portraits for Patriots" <${process.env.SMTP_FROM}>`,
        to,
        subject,
        html,
      });
    } catch (error) {
      console.error('Failed to send onboarding email:', error);
    }
  }

  static async sendVeteranWelcomeEmail(to: string, name: string) {
    try {
      const transporter = this.getTransporter();
      const subject = 'Welcome to Portraits For Patriots®';
      const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; font-size: 15px; color: #333;">
          <p>Hello ${name},</p>

          <p>Welcome to Portraits For Patriots®. We’re honored to have you join our community.</p>
  
          <p>As a national non-profit organization, we’ve had the privilege of serving thousands of transitioning service members and their families with a professional portrait. 
          Each one is a gesture of dignity, respect, and support during a pivotal chapter of their lives.</p>

          <p>Through the generosity of our volunteer photographers, we provide free professional headshots to veterans like you. Whether you’re updating your resume, 
          LinkedIn profile, or preparing for new opportunities, our goal is to help you put your best face forward.</p?
  
          <p>One last thing. In this increasingly divisive political environment, many would have us believe one side or the other has a monopoly on what defines patriotism. 
          We use Merriam-Webster’s definition. Nothing more, nothing less:</p>
  
          <blockquote style="margin: 10px 0; padding: 10px; border-left: 3px solid #2c3e50; background: #f9f9f9;">
            <p style="margin: 0;">
              <strong>patriotism</strong> [noun]<br/>
              pa·tri·ot·ism (ˈpā-trē-ə-ˌti-zəm): love for or devotion to one’s country
            </p>
          </blockquote>
  
          <p>Portraits For Patriots® is a non-political, military family support and education program. We are dedicated to empowering service members, military spouses, and Gold Star families 
          through photography and professional development—without ties to any political party, administration, or ideology.</p>
  
          <p>We’re grateful for your service and thrilled to support your next chapter.</p>
  
          <p>
            Gratefully,<br/>
            Sarah Firth<br/>
            Director of Programs<br/>
            Portraits For Patriots®
          </p>
        </div>
      `;
      await transporter.sendMail({
        from: `"Portraits for Patriots" <${process.env.SMTP_FROM}>`,
        to,
        subject,
        html,
      });
    } catch (error) {
      console.error('Failed to send onboarding email:', error);
    }
  }

  static async sendPhotographerOnboardingNotification(
    to: string,
    adminName: string,
    firstName: string,
    lastName: string,
  ) {
    const subject = 'New Photographer Onboarding Submission';
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; font-size: 15px; color: #333;">
        <p>Hello ${adminName},</p>
        <p>A photographer has just submitted their onboarding form:</p>
        <ul>
          <li><strong>Name:</strong> ${firstName} ${lastName}</li>
          <li><strong>Submitted at:</strong> ${new Date().toLocaleString()}</li>
        </ul>
        <p>You can review their details and update their status in the admin portal.</p>
        <p style="margin-top: 20px;">Best regards,<br/>Portraits for Patriots®</p>
      </div>
    `;

    await this.sendMail(to, subject, html);
  }

  static async sendApprovalEmail(to: string, name: string) {
    try {
      const transporter = this.getTransporter();
      const subject = 'Congratulations – You’re Officially a Portraiteer™';
      const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; font-size: 15px; color: #333;">
          <p>Hey ${name},</p>

          <p>Thanks for reaching out about being a volunteer photographer.</p>
  
          <p>We are truly grateful for your interest in volunteering with our program. As you are probably aware, we have a rather large national presence. In fact, we are among the largest veteran service organizations in the nation.</p>
  
          <p>In the nearly seven years since we began, we have delivered well over two-million dollars in portfolio headshots to the most deserving population in the country, and, we continue to send out over ten-thousand referrals, each year.  We are powered by volunteer “Portraiteers™" who give so generously of their time and talent to support our universally-praised mission.</p>
  
          <p>In the relatively short time since we launched our program, we have developed a recognizable brand. This has necessitated a process to maintain brand continuity and to ensure that our patriots are receiving "what we are advertising," so to speak. We understand there are hundreds of ways to make a terrific headshot. For our part, we strive for a contemporary, overtly high-end esthetic, regardless of style. All of our volunteers are studio-based with a measurable body of work.</p>
  
          <p>With this in mind, all volunteer inquiries are vetted by our photographer peer review panel to determine if the work is representative of our brand. The panel is composed of some of the most highly-regarded portrait photographers in the country, who also happen to be respected volunteers and mentors for our organization.</p>
  
          <p>By design, our founder does not sit on the panel nor is he privy to their deliberation.</p>
  
          <p><strong>After careful consideration of the following items, we are happy to welcome you to the program as the newest “Portraiteer™”!</strong></p>
  
          <p>In the coming weeks we will reach out to get a few more details from you and integrate your preferred booking links into our system.</p>
  
          <p>Stay tuned!</p>
        </div>
      `;
      await transporter.sendMail({
        from: `"Portraits for Patriots" <${process.env.SMTP_FROM}>`,
        to,
        subject,
        html,
      });
    } catch (error) {
      console.error('Failed to send onboarding email:', error);
    }
  }

  static async sendDenialEmail(to: string, name: string) {
    try {
      const transporter = this.getTransporter();
      const subject =
        'Thank You for Your Interest in Volunteering with Portraits for Patriots';
      const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; font-size: 15px; color: #333;">
          <p>Hi ${name},</p>

          <p>We are truly grateful for your interest in volunteering with our program. As you are probably aware, we have a rather large national presence. In fact, we are among the largest veteran service organizations in the nation. In the nearly <strong>seven years since we began,</strong> we have delivered well over two-million dollars in portfolio headshots to the most deserving population in the country, and, we continue to send out over ten-thousand referrals, each year. We are powered by volunteer “Portraiteers" who give so generously of their time and talent to support our universally-praised mission.</p>
  
          <p>In the relatively short time since we launched our program, we have developed a recognizable brand. This has necessitated a process to maintain brand continuity and to ensure that our patriots are receiving "what we are advertising," so to speak. We understand there are hundreds of ways to make a terrific headshot. For our part, we strive for a contemporary, overtly high-end esthetic, regardless of style. All of our volunteers are studio-based with a measurable body of work.</p>
  
          <p>With this in mind, all volunteer inquiries are vetted by our photographer peer review panel to determine if the work is representative of our brand. The panel is composed of some of the most highly-regarded portrait photographers in the country, who also happen to be respected volunteers and mentors for our organization. By design, the founder does not sit on the panel nor are they privy to the board's deliberation.</p>
  
          <p>After careful consideration of all of the following items, we regret that we cannot send referrals to you yet.</p>
  
          <p>A general list of items that we assess during reviews include but are not limited to:</p>

          <ul>
            <li>Web site/online presence</li>
            <li>Photographic style</li>
            <li>Quality of published images</li>
            <li>Social media etiquette</li>
            <li>Photographic consistency</li>
            <li>Customer reviews</li>
            <li>Unflattering content</li>
          </ul>
  
          <p>We'd love to encourage you to continue in your pursuit of photography and reach out again in the future.</p>

          <p>All the best,</p>
        </div>
      `;
      await transporter.sendMail({
        from: `"Portraits for Patriots" <${process.env.SMTP_FROM}>`,
        to,
        subject,
        html,
      });
    } catch (error) {
      console.error('Failed to send onboarding email:', error);
    }
  }

  static async sendInitialVeteranReferralEmail(
    to: string,
    name: string,
    veteranEmail: string,
    veteranPhone: string,
    veteranFirstName: string,
    veteranLastName: string,
    veteranLocation: string,
  ) {
    try {
      const transporter = this.getTransporter();
      const subject = 'You have a new referral!';
      const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; font-size: 15px; color: #333;">
          <p>Hi ${name},</p>

          <p>
            A new client has been referred to you through Portraits For Patriots®. 
            Please reach out to him/her directly to coordinate a session date and <strong>create the session in the app</strong> once confirmed.
          </p>

          <h3>Client Details:</h3>
          <ul>
            <li><strong>Name:</strong> ${veteranFirstName} ${veteranLastName}</li>
            <li><strong>Email:</strong> ${veteranEmail}</li>
            <li><strong>Phone:</strong> ${veteranPhone}</li>
            <li><strong>Location:</strong> ${veteranLocation}</li>
          </ul>
  
          <p style="margin-top: 20px;">
            Thank you for volunteering your time and talent to support our mission. 
            Your contribution makes a lasting impact on those transitioning into civilian life. 
          </p>

          <p>With gratitude,<br/>
          <strong>The Portraits For Patriots® Team</strong></p>
        </div>
      `;
      await transporter.sendMail({
        from: `"Portraits for Patriots" <${process.env.SMTP_FROM}>`,
        to,
        subject,
        html,
      });
    } catch (error) {
      console.error('Failed to send initial veteran referral email:', error);
    }
  }

  static async sendInitialPhotographerReferralEmail(
    to: string,
    name: string,
    photographerEmail: string,
    photographerPhone: string,
    photographerFirstName: string,
    photographerLastName: string,
    photographerLocation: string,
  ) {
    try {
      const transporter = this.getTransporter();
      const subject =
        'Your Photographer Referral – Next Steps to Schedule Your Session';
      const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; font-size: 15px; color: #333;">
          <p>Hi ${name},</p>

          <p>
            We’re excited to let you know that you’ve been referred to one of our volunteer photographers. 
            Please reach out to them directly to schedule your portrait session.
          </p>

          <h3>Photographer Details:</h3>
          <ul>
            <li><strong>Name:</strong> ${photographerFirstName} ${photographerLastName}</li>
            <li><strong>Email:</strong> ${photographerEmail}</li>
            <li><strong>Phone:</strong> ${photographerPhone}</li>
            <li><strong>Location:</strong> ${photographerLocation}</li>
          </ul>
  
          <p style="margin-top: 20px;">
            We encourage you to connect with your photographer soon to set a date and time that works best for you. 
            Your photographer will guide you through the process and ensure you receive a professional portrait to support your next chapter. 
          </p>

          <p>Respectfully,<br/>
          <strong>The Portraits For Patriots® Team</strong></p>
        </div>
      `;
      await transporter.sendMail({
        from: `"Portraits for Patriots" <${process.env.SMTP_FROM}>`,
        to,
        subject,
        html,
      });
    } catch (error) {
      console.error(
        'Failed to send initial photographer referral email:',
        error,
      );
    }
  }

  static async sendReferralReminderEmail(
    to: string,
    name: string,
    veteranFirstName: string,
    veteranLastName: string,
  ) {
    try {
      const transporter = this.getTransporter();
      const subject =
        'Reminder: Please create a session for your referred client';
      const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; font-size: 15px; color: #333;">
          <p>Hi ${name},</p>

          <p>About a week ago, you were referred a new client (${veteranFirstName} ${veteranLastName}) through Portraits For Patriots®. We don’t yet see a session created in the app for this referral.</p>
  
          <p>Please take a moment to <strong>log in and create the session in the app</strong> so we can keep everything up to date. If you’ve already scheduled the shoot directly, just add the session details in the app when you can.</p>
  
          <p>Thanks so much for helping us keep clients connected with their photographers.</p>
  
          <p>
            Gratefully,<br/>
            <strong>The Portraits For Patriots® Team</strong>
          </p>
        </div>
      `;
      await transporter.sendMail({
        from: `"Portraits for Patriots" <${process.env.SMTP_FROM}>`,
        to,
        subject,
        html,
      });
    } catch (error) {
      console.error('Failed to send onboarding email:', error);
    }
  }

  static async sendSessionReminderEmail(
    to: string,
    name: string,
    sessionName: string,
  ) {
    try {
      const transporter = this.getTransporter();
      const subject = 'Reminder: Please update your session details in the app';
      const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; font-size: 15px; color: #333;">
          <p>Hi ${name},</p>

          <p>We noticed your session, ${sessionName}, took place about a week ago. The session is still marked as scheduled in the system.</p>
  
          <p>When you have a chance, please <strong>log in to the app and update the session status</strong>. If the session is complete or canceled, you can also provide your feedback and final details there.</p>
  
          <p>Keeping this information current helps us support clients and ensure every session is properly documented.</p>

          <p>Thank you for your dedication and for giving your time and talent to this mission.</p>
  
          <p>
            Gratefully,<br/>
            <strong>The Portraits For Patriots® Team</strong>
          </p>
        </div>
      `;
      await transporter.sendMail({
        from: `"Portraits for Patriots" <${process.env.SMTP_FROM}>`,
        to,
        subject,
        html,
      });
    } catch (error) {
      console.error('Failed to send onboarding email:', error);
    }
  }
}
