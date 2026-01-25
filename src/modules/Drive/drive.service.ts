import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import * as mime from 'mime-types';
import * as path from 'path';
import * as fs from 'fs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DriveService {
  private oAuth2Client;
  private drive;

  constructor(
    private configService: ConfigService
  ) {
    const client_id = this.configService.get('CLIENT_ID');
    const client_secret = this.configService.get('CLIENT_SECRET');
    const redirect_url = this.configService.get('REDIRECT_URI');
    const refresh_token = this.configService.get('REFRESH_TOKEN');

    this.oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_url);

    this.oAuth2Client.setCredentials({ refresh_token: refresh_token });
    this.drive = google.drive({ version: "v3", auth: this.oAuth2Client });
    console.log('googledrive init')
  }

  async setFilePublic(fileId) {
    try {
      await this.drive.permissions.create({
        fileId,
        requestBody: {
          role: "reader",
          type: "anyone"
        }
      })

      const getUrl = await this.drive.files.get({
        fileId,
        fields: "webViewLink, webContentLink, id, name"
      })
      return getUrl;
    } catch (error) {
      console.log("error: ", error);
    }
  }
  async uploadFile(filePath, folderId) { //1xElKN_uhzxFBlkeFOGPv_Gw7cZwfoKf_
    try {
      const mimeType = mime.lookup(filePath) || "application/octet-stream";
      const createFile = await this.drive.files.create({
        requestBody: {
          name: path.basename(filePath),
          mimeType,
          parents: [folderId]
        },
        media: {
          body: fs.createReadStream(filePath),
          mimeType, // đổi nếu không phải mp4
        }
      })

      const fileId = createFile.data.id;
      // chia sẻ khi có link
      const getUrl = await this.setFilePublic(fileId);
      console.log("getUrl: ", getUrl.data);
      return getUrl.data;

    } catch (error) {
      console.log("error: ", error);
    }
  }
  async deleteFile(fileId) {
    try {
      const deleteFile = await this.drive.files.delete({ fileId });
      console.log("deleteFile: ", deleteFile.data, deleteFile.status);

    } catch (error) {
      console.log("error: ", error);
    }
  }

}
