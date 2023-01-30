import fetch from "node-fetch";
import { Logger } from "loglevel";

export class ForensicsClient {
  constructor(private email: string, private logger: Logger) {}

  public async get(path: string) {
    const url = `https://which-technical-exercise.herokuapp.com/api/${this.email}/${path}`;
    this.logger.info(`making request at ${url}`);

    const response = await fetch(url);
    this.logger.info(`response received with status code ${response.status}`);

    const json = await response.json();
    this.logger.info(
      `json response parsed with content ${JSON.stringify(json)}`
    );

    return json;
  }
}
