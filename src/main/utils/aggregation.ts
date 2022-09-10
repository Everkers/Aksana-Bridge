// Skins
// Chromas
// Wards
// Loot
// Honor
// Email Verification

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
    await Promise.all(
      requestedData.map(async (item, i) => {
        const progress = Math.abs(((i + 1) / requestedData.length) * 100);
        this.webContents?.send('opperation-progress', progress);
        const data = await this.call(item.endpoint);
        return { [item.key]: data.data };
      })
    );
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
