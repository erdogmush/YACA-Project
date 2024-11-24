// Controller serving the home page

import Controller from './controller';
import { Request, Response } from 'express';

export default class HomeController extends Controller {
  public constructor(path: string) {
    super(path);
  }

  // Just redirection going on here, nothing fancy
  // Plus a an about page generated on the fly

  public initializeRoutes(): void {
    this.router.get('/', this.indexPage);
    this.router.get('/home', this.homePage);
    this.router.get('/about', this.aboutPage);
  }

  public indexPage(req: Request, res: Response): void {
    res.redirect('/pages/index.html');
  }

  public homePage(req: Request, res: Response): void {
    res.redirect('/');
  }

  public aboutPage(req: Request, res: Response): void {
    // const about: 'This is YACA Server';
    // TODO: generate and serve plain html containing the about string
    const aboutHtml = `
      <!doctype html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>About YACA</title>
        </head>
        <body>
          <h1>About YACA</h1>
          <p>YACA is an Express.js app built using TypeScript, HTML, and CSS.</p>
          <p>This YACA version was created by Yichi Zhang at CMU.</p>
          <p>YACA means Yet Another Chat App. YACA is running on ${req.hostname} at port ${req.socket.localPort}.</p>
        </body>
      </html>
    `;
    res.send(aboutHtml);
  }
}
