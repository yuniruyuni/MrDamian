import { type Express } from 'express';

export function register_endpoints(app: Express) {
    app.get('/system/oauth', async (req, res) => {
        res.send(oauth);
    });
}

const oauth = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
  </head>
  <script>
    window.onload = function() {
      if (location.hash) {
        const param = Object.fromEntries(new URLSearchParams(location.hash));
        const token = document.getElementById('token');
        window.api.setToken(param["#access_token"]);
      }
    }
  </script>
  <body>twitch loggin successful</body>
</html>
`;
