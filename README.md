# SCHEMA-lab

SCHEMA Lab is an open-source platform developed to assist researchers and scientists in managing and executing computational tasks efficiently. The platform specializes in submitting and monitoring containerized task execution requests, providing a seamless environment for your computational needs.

# Deployment

## Deploy on a local environment

1. Clone repository to your environment

   ```
   git clone https://github.com/athenarc/schema-lab.git
   ```

2. Navigate inside the code directory

   ```
   cd schema-lab/schema-lab
   ```

3. Install external packages

   ```
   npm install
   ```

4. Configure application by creating a .env file. You may use the provided .env.template file and change the values as needed.

   ```
   cp .env.template .env
   vim .env
   ```

5. When done, you may start the development server
   ```
   npm start
   ```

## Customize SCHEMA lab

1: Edit `~./src/config/config.json` file and update the tag data. Follows, the default json format.

```
{
   "title": "SCHEMA lab",
   "favicon_logo": "media/schema/favicon.ico",
   "landing_page": {
       "title": "Welcome to SCHEMA lab",
       "subtitle": "Your platform for managing computational tasks",
       "logo":"media/schema/logo.png",
       "logo_alt":"Schema Logo",
       "image": "media/schema/welcome.png",
       "image_alt":"Schema Image"
   },

   "footer": {
       "footerMainText":"Powered by",
       "footerLink": "https://github.com/athenarc/schema-lab",
       "footerLinkText": "SCHEMA lab",
       "footerExtraText": "Copyright © 2024, SCHEMA lab, ATHENA RC."
   },

   "pagination": {
       "taskPerPage": 10
   }
 }

```

2: Update the color scheme by updating `~./src/index.scss` file with your prefered `$primary` and `$secondary` color codes.

3: Update `About Us` template page with your own data. Go to `~./src/routes.jsx` and replace
`import AboutusTemplate from './layouts/Aboutus_template';` code line with you own jsx script.
