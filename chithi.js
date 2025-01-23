const LZString = require("lz-string");
const axios = require("axios");
const { TEMPLATES, THEMES } = require("./data.js");

class ChithiService {
  constructor(userAgent) {
    this.baseUrl = "https://chithi.pockethost.io";
    this.userAgent = userAgent;
    this.token = null;
    this.refreshTimeout = null;

    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        "Content-Type": "application/json",
        "User-Agent":
          userAgent ||
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      },
    });

    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401 && this.token) {
          try {
            await this.refreshAuth();

            const originalRequest = error.config;
            originalRequest.headers.Authorization = this.token;
            return this.client(originalRequest);
          } catch (refreshError) {
            this.token = null;
            throw refreshError;
          }
        }
        throw error;
      }
    );
  }

  async register(username, email, password) {
    try {
      const registrationResponse = await this.client.post(
        "/api/collections/users/records",
        {
          username,
          email,
          password,
          passwordConfirm: password
        }
      );

      const loginResponse = await this.login(username, password);

      return {
        registrationData: registrationResponse.data,
        userData: loginResponse
      };
    } catch (error) {
      throw new Error(`Registration failed: ${error.message}`);
    }
  }

  async login(identity, password) {
    try {
      const response = await this.client.post(
        "/api/collections/users/auth-with-password",
        {
          identity,
          password,
        }
      );

      this.token = response.data.token;
      this.client.defaults.headers.common.Authorization = this.token;

      this._scheduleTokenRefresh();

      return response.data.record;
    } catch (error) {
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  async refreshAuth() {
    try {
      const response = await this.client.post(
        "/api/collections/users/auth-refresh"
      );
      this.token = response.data.token;
      this.client.defaults.headers.common.Authorization = this.token;

      this._scheduleTokenRefresh();

      return response.data.record;
    } catch (error) {
      this.token = null;
      throw new Error(`Auth refresh failed: ${error.message}`);
    }
  }

  _scheduleTokenRefresh() {
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
    }

    this.refreshTimeout = setTimeout(
      () => this.refreshAuth(),
      24 * 60 * 55 * 1000
    );
  }

  async updateFCMToken(userId, fcmToken) {
    try {
      const response = await this.client.patch(
        `/api/collections/users/records/${userId}`,
        { fcm: fcmToken }
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update FCM token: ${error.message}`);
    }
  }

  async getMailbox(page = 1, perPage = 30) {
    try {
      const response = await this.client.get(
        "/api/collections/letters/records",
        {
          params: {
            page,
            perPage,
            skipTotal: true,
            sort: "-created",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch mailbox: ${error.message}`);
    }
  }

  async generateLetter(language = "english") {
    const template = TEMPLATES[language] || TEMPLATES.english;
    return [
      this._randomPick(template.GREETINGS),
      "",
      this._randomPick(template.QUESTIONS),
      "",
      this._randomPick(template.WISHES),
      this._randomPick(template.SIGNATURES),
    ].join("\n");
  }

  generateHistory(content) {
    const history = [];
    let currentText = "";
    for (let i = 0; i < content.length; i++) {
      const char = content[i];
      if (currentText[i] && currentText[i] !== char) {
        history.push({
          type: "d",
          pos: i,
          text: currentText[i],
        });
        currentText = currentText.slice(0, i) + currentText.slice(i + 1);
      }
      history.push({
        type: "i",
        pos: i,
        text: char,
      });
      currentText = currentText.slice(0, i) + char + currentText.slice(i);
    }
    return history;
  }

  async sendLetter({ content, username, theme = "vintage", information = {} }) {
    if (!username) throw new Error("A username is required!");
    if (content.length < 5) throw new Error("Letter too short!");
    if (!this.validateTheme(theme)) {
      throw new Error(
        `${theme} is not a valid theme. Available themes are ${this.getThemes().join(
          ", "
        )}.`
      );
    }

    const user = await this.getUserInfo(username);
    const payload = {
      content,
      user: user.id,
      history: this.generateHistory(content),
      theme,
      information: {
        complete_device_name: "Google Chrome",
        form_factor: "Desktop",
        is_mobile: false,
        resolution: "900x1440",
        user_agent:
          this.userAgent ||
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        ...information,
      },
    };

    const compressedData = LZString.compressToBase64(JSON.stringify(payload));

    try {
      const response = await this.client.post("/api/chithi/letters", {
        data: compressedData,
      });
      console.log(`Chithi was successfully sent to ${username}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to send letter: ${error.message}`);
    }
  }

  async getUserInfo(username) {
    try {
      const response = await this.client.get(`/api/chithi/users/${username}`);
      return {
        ...response.data,
        avatar: `${this.baseUrl}/api/files/${response.data.collectionId}/${response.data.id}/${response.data.avatar}?thumb=300x300f`,
      };
    } catch (error) {
      throw new Error(`Failed to get user info: ${error.message}`);
    }
  }

  _randomPick(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  getThemes() {
    return Object.keys(THEMES);
  }

  validateTheme(theme) {
    return THEMES.hasOwnProperty(theme);
  }

  decompressLetter(compressedData) {
    try {
      const jsonData = LZString.decompressFromBase64(compressedData);
      return JSON.parse(jsonData);
    } catch (error) {
      throw new Error("Failed to decompress letter data");
    }
  }
}

module.exports = { ChithiService, THEMES, TEMPLATES };
