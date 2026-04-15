
  export function createWelcomeEmailTemplate(name, clientURL) {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Messenger</title>
  </head>

  <body style="margin:0; padding:0; background:#eef2f7; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">

    <div style="max-width:600px; margin:40px auto; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,0.08);">

      
      <div style="background: linear-gradient(135deg, #36D1DC, #5B86E5); padding:40px 20px; text-align:center;">
        <img src="https://img.freepik.com/free-vector/hand-drawn-message-element-vector-cute-sticker_53876-118344.jpg"
          alt="Messenger Logo"
          style="width:90px; height:90px; border-radius:50%; background:#ffffff; padding:10px; box-shadow:0 4px 10px rgba(0,0,0,0.1); margin-bottom:15px;">
        
        <h1 style="color:#ffffff; margin:0; font-size:30px; font-weight:600; letter-spacing:0.5px;">
          Welcome to Messenger 🚀
        </h1>

        <p style="color:#eaf6ff; margin-top:10px; font-size:15px;">
          Connect. Chat. Share instantly.
        </p>
      </div>

      {/* <!-- Content --> */}
      <div style="padding:35px 30px; color:#444;">

        <p style="font-size:18px; margin-bottom:10px;">
          Hi <strong style="color:#5B86E5;">${name}</strong>,
        </p>

        <p style="margin-top:0;">
          We're excited to have you on board! Your new messaging experience starts now — fast, simple, and built for real-time connection.
        </p>

        
        <div style="background:#f8fafc; border-radius:12px; padding:25px; margin:25px 0; border:1px solid #e3e8ef;">
          <p style="margin-top:0; font-weight:600; font-size:16px;">
            🚀 Get started quickly:
          </p>

          <ul style="padding-left:18px; margin:10px 0;">
            <li style="margin-bottom:8px;">Customize your profile</li>
            <li style="margin-bottom:8px;">Add and discover contacts</li>
            <li style="margin-bottom:8px;">Start chatting instantly</li>
            <li>Share media & stay connected</li>
          </ul>
        </div>

        
        <div style="text-align:center; margin:35px 0;">
          <a href="${clientURL}"
            style="
              display:inline-block;
              background: linear-gradient(135deg, #36D1DC, #5B86E5);
              color:#ffffff;
              text-decoration:none;
              padding:14px 35px;
              border-radius:50px;
              font-size:16px;
              font-weight:600;
              box-shadow:0 6px 15px rgba(91,134,229,0.4);
              transition:all 0.3s ease;
            ">
            Open Messenger
          </a>
        </div>

        <p style="font-size:14px; color:#666;">
          Need help? Our support team is always ready to assist you.
        </p>

        <p style="margin-top:25px;">
          Cheers,<br>
          <strong>The Messenger Team</strong>
        </p>
      </div>

    
      <div style="background:#f1f5f9; text-align:center; padding:20px; font-size:12px; color:#888;">
        <p style="margin:0;">© 2025 Messenger. All rights reserved.</p>
        <div style="margin-top:10px;">
          <a href="#" style="color:#5B86E5; text-decoration:none; margin:0 8px;">Privacy</a>
          <a href="#" style="color:#5B86E5; text-decoration:none; margin:0 8px;">Terms</a>
          <a href="#" style="color:#5B86E5; text-decoration:none; margin:0 8px;">Support</a>
        </div>
      </div>

    </div>

  </body>
  </html>
    `;}