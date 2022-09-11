import axios from 'axios';
import { WebContents } from 'electron';
import https from 'https';
import requestedData from '../constants';

interface LcuResponse {
  address: string;
  port: number;
  username: string;
  password: string;
  protocol: string;
}

class Aggregation {
  private summonerId: string = '';

  private request: { auth: string; url: string } = { auth: '', url: '' };

  lcuRes: LcuResponse;

  webContents: WebContents | undefined;

  constructor(lcuRes: LcuResponse, webContents: WebContents | undefined) {
    this.lcuRes = lcuRes;
    this.webContents = webContents;
  }

  private async getSommonerProfile() {
    const profile = await this.call('/lol-summoner/v1/current-summoner');
    this.summonerId = profile.data.summonerId;
    return profile.data;
  }

  private async aggregate() {
    this.webContents?.send('status-update', 'starting');
    const res = await Promise.all(
      requestedData.map(async (item, i) => {
        const progress = Math.abs(((i + 1) / requestedData.length) * 100);
        this.webContents?.send('opperation-progress', progress);
        const data = await this.call(item.endpoint)
          .catch((err) => {
            throw err;
          })
          .then((x) => ({ [item.key]: x }));
        return data;
      })
    ).catch(() => this.webContents?.send('status-update', 'error'));
    if (res) {
      this.webContents?.send('status-update', 'done');
    }
  }

  private formatEndpoint(endpoint: string) {
    if (endpoint.includes('{summonerId}'))
      return endpoint.replace('{summonerId}', this.summonerId);
    return endpoint;
  }

  private async call(endpoint: string, data?: string) {
    const agent = new https.Agent({
      rejectUnauthorized: false,
    });
    try {
      const res = await axios(
        `${this.request.url}${this.formatEndpoint(endpoint)}`,
        {
          method: 'GET',
          httpsAgent: agent,
          data,
          headers: {
            Accept: 'application/json',
            Authorization: this.request.auth,
          },
        }
      );
      return res;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async init() {
    this.request = {
      url: `${this.lcuRes.protocol}://${this.lcuRes.address}:${this.lcuRes.port}`,
      auth: `Basic ${Buffer.from(
        `${this.lcuRes.username}:${this.lcuRes.password}`
      ).toString('base64')}`,
    };
    await this.getSommonerProfile();
    await this.aggregate();
  }
}

export default Aggregation;
