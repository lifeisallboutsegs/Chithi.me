const LZString = require("lz-string");
const axios = require("axios");
const fs = require("fs");
const { TEMPLATES, THEMES } = require("./data.js");

const TOKEN_FILE_PATH = "./token.json";

class ChithiService {
  constructor({ username, password, userAgent } = {}) {
    this.baseUrl = "https://chithi.pockethost.io";
    this.userAgent = userAgent;
    this.username = username;
    this.password = password;
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
            console.info(
              "Token expired, attempting to refresh authentication..."
            );
            await this.refreshAuth();
            const originalRequest = error.config;
            originalRequest.headers.Authorization = this.token;
            return this.client(originalRequest);
          } catch (refreshError) {
            try {
              console.info("Auth refresh failed, attempting to relogin...");
              await this._handleAuthentication();
              const originalRequest = error.config;
              originalRequest.headers.Authorization = this.token;
              return this.client(originalRequest);
            } catch (loginError) {
              console.error(
                "Authentication failed during relogin:",
                loginError.message
              );
              this.token = null;
              throw loginError;
            }
          }
        }
        console.error("API request failed:", error.message);
        throw error;
      }
    );

    this._initializeAuth();
  }

  async _initializeAuth() {
    try {
      const tokenValid = await this._loadTokenFromFile();
      if (tokenValid) {
        console.info("Logged in with saved session.");
      } else if (this.username && this.password) {
        console.info("Saved session invalid, trying to relogin.");
        await this._handleAuthentication();
      } else {
        console.error("No username or password provided for login.");
      }
    } catch (error) {
      console.error("Authentication initialization failed:", error.message);
    }
  }

  async _loadTokenFromFile() {
    if (fs.existsSync(TOKEN_FILE_PATH)) {
      try {
        const data = fs.readFileSync(TOKEN_FILE_PATH);
        const tokenData = JSON.parse(data);

        if (tokenData.token) {
          const tokenPayload = JSON.parse(
            Buffer.from(tokenData.token.split(".")[1], "base64").toString()
          );

          if (tokenPayload.exp * 1000 > Date.now()) {
            this.token = tokenData.token;
            this.client.defaults.headers.common.Authorization = this.token;
            this._scheduleTokenRefresh();
            console.info("Token loaded successfully from file.");
            return true;
          } else {
            console.warn("Token expired, attempting to refresh...");
          }
        }
      } catch (err) {
        console.error("Failed to load token from file:", err.message);
      }
    }
    return false;
  }

  _saveTokenToFile() {
    if (this.token) {
      const data = { token: this.token };
      fs.writeFileSync(TOKEN_FILE_PATH, JSON.stringify(data), "utf8");
      console.info("Token saved to file.");
    }
  }

  async _handleAuthentication() {
    if (!this.username || !this.password) {
      throw new Error("Username and password are required for authentication");
    }
    return this.login(this.username, this.password);
  }

  async login(identity, password) {
    try {
      console.info(`Attempting login for user: ${identity}`);
      const response = await this.client.post(
        "/api/collections/users/auth-with-password",
        { identity, password }
      );

      this.token = response.data.token;
      this.client.defaults.headers.common.Authorization = this.token;
      this._saveTokenToFile();
      this._scheduleTokenRefresh();
      console.info("Login successful.");
      return response.data.record;
    } catch (error) {
      console.error("Login failed:", error.message);
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  async refreshAuth() {
    try {
      console.info("Refreshing authentication...");
      const response = await this.client.post(
        "/api/collections/users/auth-refresh"
      );
      this.token = response.data.token;
      this.client.defaults.headers.common.Authorization = this.token;
      this._saveTokenToFile();
      this._scheduleTokenRefresh();
      console.info("Auth refresh successful.");
      return response.data.record;
    } catch (error) {
      this.token = null;
      console.error("Auth refresh failed:", error.message);
      throw new Error(`Auth refresh failed: ${error.message}`);
    }
  }

  _scheduleTokenRefresh() {
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
    }

    const tokenPayload = JSON.parse(
      Buffer.from(this.token.split(".")[1], "base64").toString()
    );
    const expirationTime = tokenPayload.exp * 1000;
    const currentTime = Date.now();
    const timeUntilExpiry = expirationTime - currentTime;
    const refreshTime = Math.max(timeUntilExpiry - 5 * 60 * 1000, 0);

    this.refreshTimeout = setTimeout(() => {
      console.info("Token about to expire, refreshing...");
      this.refreshAuth();
    }, refreshTime);
  }

  _getMimeType(path) {
    const ext = this._getFileExtension(path).toLowerCase();
    const mimeTypes = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
    };
    return mimeTypes[ext] || "image/jpeg";
  }

  _getFileExtension(input) {
    if (input instanceof File) {
      return "." + input.name.split(".").pop();
    }
    if (typeof input === "string") {
      const match = input.match(/\.([^.]+)$/);
      return match ? "." + match[1] : ".jpg";
    }
    return ".jpg";
  }

  async updateFCMToken(userId, fcmToken) {
    try {
      const response = await this.client.patch(
        `/api/collections/users/records/${userId}`,
        { fcm: fcmToken }
      );
      console.info("FCM token updated successfully.");
      return response.data;
    } catch (error) {
      console.error("Failed to update FCM token:", error.message);
      throw new Error(`Failed to update FCM token: ${error.message}`);
    }
  }

  async getMailbox(page = 1, perPage = 30) {
    try {
      const response = await this.client.get(
        "/api/collections/letters/records",
        {
          params: { page, perPage, skipTotal: true, sort: "-created" },
        }
      );
      console.info("Mailbox fetched successfully.");
      return response.data;
    } catch (error) {
      console.error("Failed to fetch mailbox:", error.message);
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

  async pauseAccount(pauseState) {
    if (!this.token) {
      console.error(
        "Not logged in. Please log in to pause/unpause your account."
      );
      throw new Error(
        "Not logged in. Please log in to pause/unpause your account."
      );
    }

    try {
      const tokenPayload = JSON.parse(
        Buffer.from(this.token.split(".")[1], "base64").toString()
      );
      const userId = tokenPayload.id;

      const response = await this.client.patch(
        `/api/collections/users/records/${userId}`,
        { paused: pauseState },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: this.token,
          },
        }
      );
      console.info(
        `${pauseState ? "Paused" : "Unpaused"} account successfully.`
      );
      return response.data;
    } catch (error) {
      console.error(
        `Failed to ${pauseState ? "pause" : "unpause"} account:`,
        error.message
      );
      throw new Error(
        `Failed to ${pauseState ? "pause" : "unpause"} account: ${
          error.message
        }`
      );
    }
  }

  async updateAvatar(input) {
    if (!this.token) {
      console.error("Not logged in. Please log in to update your avatar.");
      throw new Error("Not logged in. Please log in to update your avatar.");
    }

    try {
      const tokenPayload = JSON.parse(
        Buffer.from(this.token.split(".")[1], "base64").toString()
      );
      const userId = tokenPayload.id;

      let imageBlob;
      if (input instanceof File || input instanceof Blob) {
        imageBlob = input;
      } else if (typeof input === "string") {
        if (input.startsWith("http://") || input.startsWith("https://")) {
          const response = await fetch(input);
          if (!response.ok) {
            console.error(
              "Failed to fetch image from URL:",
              response.statusText
            );
            throw new Error(
              `Failed to fetch image from URL: ${response.statusText}`
            );
          }
          imageBlob = await response.blob();
        } else {
          if (typeof window === "undefined" && require) {
            const fs = require("fs").promises;
            const buffer = await fs.readFile(input);
            imageBlob = new Blob([buffer], {
              type: this._getMimeType(input),
            });
          } else {
            console.error(
              "File path reading is only supported in Node.js environment."
            );
            throw new Error(
              "File path reading is only supported in Node.js environment"
            );
          }
        }
      } else {
        console.error("Invalid input type for avatar.");
        throw new Error(
          "Invalid input type. Please provide a URL, file path, or File/Blob object"
        );
      }

      const formData = new FormData();
      formData.append(
        "avatar",
        imageBlob,
        "avatar" + this._getFileExtension(input)
      );

      const response = await this.client.patch(
        `/api/collections/users/records/${userId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: this.token,
          },
        }
      );

      const avatarUrl = `${this.baseUrl}/api/files/${response.data.collectionId}/${response.data.id}/${response.data.avatar}`;

      console.info("Avatar updated successfully.");
      return {
        ...response.data,
        avatarUrl,
      };
    } catch (error) {
      console.error("Failed to update avatar:", error.message);
      throw new Error(`Failed to update avatar: ${error.message}`);
    }
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
      console.info("Letter sent successfully.");
      return response.data;
    } catch (error) {
      console.error("Failed to send letter:", error.message);
      throw new Error(`Failed to send letter: ${error.message}`);
    }
  }

  async getUserInfo(username) {
    try {
      const response = await this.client.get(`/api/chithi/users/${username}`);
      console.info(`User info fetched for ${username}.`);
      return {
        ...response.data,
        avatar: `${this.baseUrl}/api/files/${response.data.collectionId}/${response.data.id}/${response.data.avatar}?thumb=300x300f`,
      };
    } catch (error) {
      console.error(`Failed to get user info: ${error.message}`);
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
      console.error("Failed to decompress letter data:", error.message);
      throw new Error("Failed to decompress letter data");
    }
  }
}

module.exports = { ChithiService, THEMES, TEMPLATES };
