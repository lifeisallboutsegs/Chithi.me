const LZString = require("lz-string");
const axios = require("axios");

const THEMES = {
  vintage: "vintage",
  signature: "signature",
  elegant: "elegant",
  retro: "retro",
};

const TEMPLATES = {
  bengali: {
    GREETINGS: [
      "হেলো!",
      "হাই!",
      "সালাম!",
      "নমস্কার!",
      "আদাব!",
      "শুভ সকাল!",
      "শুভ অপরাহ্ন!",
      "শুভ সন্ধ্যা!",
      "শুভ রাত্রি!",
      "স্বাগতম!",
      "শুভ দিন!",
      "আশীর্বাদ গ্রহণ করুন!",
      "শুভেচ্ছা!",
      "আসসালামু আলাইকুম!",
      "সুপ্রভাত!",
      "বিকেলের শুভেচ্ছা!",
      "রাত্রির শুভেচ্ছা!",
    ],
    WISHES: [
      "আপনার জন্য প্রার্থনা করছি।",
      "ভালো থাকবেন।",
      "সুস্থ থাকুন।",
      "আপনার ভবিষ্যৎ উজ্জ্বল হোক।",
      "আপনার জীবনে সুখ ও শান্তি আসুক।",
      "সফলতা আপনার সঙ্গী হোক।",
      "সব সময় হাসিখুশি থাকুন।",
      "আপনার স্বপ্নগুলো পূর্ণ হোক।",
      "জীবনটা আনন্দময় হোক।",
      "ভালোবাসায় ভরে উঠুক আপনার দিন।",
      "আপনার পরিবারের সবাই যেন সুখী থাকে।",
      "দীর্ঘায়ু লাভ করুন।",
      "আপনার হৃদয় যেন সবসময় আনন্দে ভরে থাকে।",
      "সাফল্য যেন আপনার পায়ের নীচে থাকে।",
      "আপনার দিনটা দারুণ কাটুক।",
      "আপনার জন্য শুভকামনা রইল।",
      "আপনার কর্মজীবন সফল হোক।",
      "আপনার স্বাস্থ্যের প্রতি যত্ন নিন।",
      "যে কাজই করেন, সেটাতে সফল হোন।",
      "আপনার জন্য সুখের প্রতিটি দরজা খুলে যাক।",
      "আপনার হৃদয়ে শান্তি নেমে আসুক।",
      "আপনার সব ইচ্ছা পূরণ হোক।",
      "আপনার পথচলা মসৃণ হোক।",
      "আশীর্বাদ বর্ষিত হোক।",
      "আপনার চারপাশ সুখে ভরে থাকুক।",
      "আপনার জন্য আল্লাহর রহমত কামনা করি।",
      "সবসময় ইতিবাচক থাকুন।",
      "আপনার জীবন ফুলের মতো সৌরভে ভরে উঠুক।",
      "আপনার প্রতিটি দিনই যেন বিশেষ হয়।",
      "আপনার মুখে সবসময় হাসি লেগে থাকুক।",
      "আপনার জীবনের প্রতিটি মুহূর্ত সুন্দর হোক।",
      "শান্তি এবং সাফল্য আপনার জীবনের অংশ হোক।",
      "আপনার কঠোর পরিশ্রমের ফল আপনি পান।",
      "আপনার সমস্ত স্বপ্ন যেন বাস্তব হয়।",
      "জীবনে এগিয়ে চলুন।",
      "আপনার জীবনের প্রতিটি অধ্যায় আনন্দদায়ক হোক।",
      "আপনার ভবিষ্যৎ যেন সুখময় হয়।",
      "আপনার আশেপাশের মানুষদের মুখে হাসি ফোটান।",
      "আপনার প্রতিটি সিদ্ধান্ত আপনাকে সাফল্যের পথে নিয়ে যাক।",
      "ভালো কাজ করার জন্য উৎসাহ পান।",
      "আপনার জীবনের গল্প অনুপ্রেরণার হয়ে উঠুক।",
    ],
    QUESTIONS: [
      "আপনার প্রিয় বন্ধু কে?",
      "আপনার উচ্চতা কত?",
      "আপনার প্রিয় রং কোনটি?",
      "আপনার সবচেয়ে বড় স্বপ্ন কী?",
      "আপনার জীবনের সবচেয়ে আনন্দময় মুহূর্ত কোনটি?",
      "আপনি কোন জায়গায় ভ্রমণ করতে পছন্দ করবেন?",
      "আপনার প্রিয় খাবার কী?",
      "আপনার বয়স কত?",
      "আপনার জীবনের সবচেয়ে বড় চ্যালেঞ্জ কী ছিল?",
      "আপনার পছন্দের গান কোনটি?",
      "আপনি কার কাছ থেকে সবচেয়ে বেশি অনুপ্রাণিত হন?",
      "আপনার শৈশবের স্মৃতি কেমন?",
      "আপনার প্রিয় বইয়ের নাম কী?",
      "আপনার ভবিষ্যৎ পরিকল্পনা কী?",
      "আপনি সকালে ওঠার পর প্রথমে কী করেন?",
      "আপনার শিক্ষাজীবনের সবচেয়ে প্রিয় শিক্ষক কে?",
      "আপনি কার সাথে সবচেয়ে বেশি সময় কাটাতে পছন্দ করেন?",
      "আপনার প্রিয় সিনেমার নাম কী?",
      "আপনার জীবনের সবচেয়ে বড় শিক্ষা কী?",
      "আপনার সবচেয়ে প্রিয় উক্তি কী?",
      "আপনি যদি কিছু বদলাতে পারতেন, সেটা কী হতো?",
      "আপনার প্রিয় উৎসব কোনটি?",
      "আপনার পছন্দের খেলার নাম কী?",
      "আপনার পরিবারে আপনাকে সবচেয়ে ভালো বোঝে কে?",
      "আপনার প্রিয় ঋতু কোনটি?",
      "আপনার প্রথম কাজের অভিজ্ঞতা কেমন ছিল?",
      "আপনার সবচেয়ে ভয় পেতে হয় কোন জিনিসে?",
      "আপনার প্রিয় পশু বা পাখি কী?",
      "আপনি কোন ধরনের লোককে পছন্দ করেন না?",
      "আপনার জীবনের সবচেয়ে বড় অনুশোচনা কী?",
      "আপনার পছন্দের গানশিল্পী কে?",
      "আপনার প্রিয় স্মার্টফোন ব্র্যান্ড কোনটি?",
      "আপনার প্রিয় শখ কী?",
      "আপনার পড়ার অভ্যাস কেমন?",
      "আপনার ঘুমানোর সময় কী করেন?",
      "আপনার প্রথম প্রেমের গল্প কী?",
      "আপনার কাছে সত্যের সংজ্ঞা কী?",
      "আপনার প্রিয় ছুটির দিন কীভাবে কাটান?",
      "আপনার কোনো গোপন প্রেমের গল্প আছে?",
      "আপনি কখনো কাউকে মিথ্যে কথা বলেছেন যাতে তাদের খুশি করতে পারেন?",
      "আপনি কি কখনো পরীক্ষা দেওয়ার সময় নকল করেছেন?",
      "আপনার ক্রাশের নাম কী?",
      "আপনার কখনো ডেটে গিয়ে অদ্ভুত কিছু ঘটেছে?",
      "আপনি কারো উপর গোপনে নজর রেখেছেন কখনো?",
      "আপনার জীবনে সবচেয়ে বড় দুষ্টুমি কী ছিল?",
      "আপনি কি কখনো স্কুলে পড়ার ভান করে বাইরে সময় কাটিয়েছেন?",
      "আপনার সবচেয়ে অদ্ভুত স্বপ্ন কী ছিল?",
      "আপনি কি কখনো কারো সামনে নিজের পছন্দ লুকিয়েছেন?",
      "আপনি কি কখনো অন্য কারো জন্য প্রেমের চিঠি লিখেছেন?",
      "আপনার ফোনে লুকানো কোনো মজার অ্যাপ আছে?",
      "আপনার এমন কোনো গোপন শখ আছে যা আপনি কাউকে বলেননি?",
      "আপনার জীবনের সবচেয়ে বিব্রতকর মুহূর্ত কী?",
      "আপনি কি কখনো কাউকে ভুয়া কথা বলে ফাঁকি দিয়েছেন?",
      "আপনার এমন কোনো কাজ আছে যা করলে সবাই হাসবে?",
      "আপনার জীবনে এমন কিছু হয়েছে যা আপনি কাউকে বলতে লজ্জা পান?",
      "আপনি কখনো অন্য কারো প্রোফাইলে স্টকিং করেছেন?",
      "আপনার এমন কোনো কথোপকথন আছে যা ভাবলে এখনো লজ্জা লাগে?",
      "আপনি কি কখনো নিজের নাম ভুল বলে ফেলেছেন?",
      "আপনার এমন কোনো স্বপ্ন ছিল যা শুনলে সবাই হাসবে?",
      "আপনি কি কখনো এমন কিছু চুরি করেছেন যা একদমই অপ্রয়োজনীয়?",
      "আপনার জীবনে কখনো কাউকে মুগ্ধ করার চেষ্টা করে হোঁচট খেয়েছেন?",
      "আপনি কি কখনো কাউকে দেখে প্রথম দর্শনে প্রেমে পড়েছেন?",
      "আপনি কি কখনো বন্ধুদের সঙ্গে দুষ্টুমি করতে গিয়ে ধরা পড়েছেন?",
      "আপনি কি কখনো কারো জন্য কল্পনায় বীর হয়ে উঠেছেন?",
      "আপনার জীবনের সবচেয়ে সাহসী সিদ্ধান্ত কী ছিল?",
      "আপনি কখনো কাউকে অপ্রত্যাশিতভাবে চমকে দিয়েছেন?",
    ],
    SIGNATURES: [
      "- কোনো এক শুভাকাঙ্ক্ষী",
      "- আপনার পরিচিত কেউ",
      "- এক অজানা বন্ধু",
      "- আপনার অজানা প্রেমিক",
      "- কেউ একজন",
      "- আপনার একান্ত আপনজন",
      "- একজন অদৃশ্য বন্ধু",
      "- আপনার জন্য অপেক্ষমাণ কেউ",
      "- এক অলস মনের মানুষ",
      "- আপনার গোপন ভক্ত",
      "- পরিচয়হীন এক বন্ধু",
      "- এক অন্তরঙ্গ শুভাকাঙ্ক্ষী",
      "- আপনার জীবনের কোনো এক ছায়া",
      "- কারো জন্য গুরুত্বপূর্ণ কেউ",
      "- আপনার প্রতি খেয়াল রাখা কেউ",
      "- নামহীন ভালোবাসা",
      "- গোপন এক অনুসারী",
      "- আপনার পাশে থাকা কেউ",
      "- নিরব দর্শক",
      "- দূর থেকে ভালোবাসা জানানো কেউ",
      "- পরিচয়হীন ভালোবাসা",
      "- আপনার আড়াল থেকে দেখছে এমন কেউ",
      "- আপনার প্রিয়জনদের একজন",
      "- মনের ভেতরের একজন",
      "- নিরব শ্রোতা",
      "- হঠাৎ করে মনে পড়া কেউ",
      "- আপনার জন্য প্রার্থনা করা কেউ",
      "- ভালোবাসায় গোপন কেউ",
      "- একান্ত নিরব ভালোবাসা",
      "- এক হারিয়ে যাওয়া বন্ধু",
      "- ছায়ার মতো থাকা কেউ",
      "- আপনার ছোটবেলার কোনো বন্ধু",
      "- একটা না বলা অনুভূতি",
      "- আপনার জীবনের এক মুহূর্ত",
      "- পরিচয়হীন এক গল্প",
      "- আপনার ভাবনার কেউ",
      "- আপনার গোপন সমর্থক",
      "- আপনার হাসির কারণ হতে চাওয়া কেউ",
      "- দূরের একজন, কাছে আসতে ইচ্ছুক",
      "- আপনার জীবন থেকে অদৃশ্য হওয়া কেউ",
      "- আপনার প্রিয় কারো অন্তরাল",
      "- কোনো এক মিষ্টি স্মৃতি",
      "- যে আপনাকে মুগ্ধ করতে চায়",
      "- কোনো এক ছায়াসঙ্গী",
      "- আপনার প্রিয়জনের হৃদয়ের শব্দ",
      "- এক অনুপ্রেরণা",
      "- আপনার জীবনের অজানা অধ্যায়",
      "- গোপনে আপনাকে দেখে এমন কেউ",
      "- আপনি যার গল্প শুনবেন",
      "- অজানা থেকে প্রেরণা হয়ে থাকা কেউ",
      "- আপনার মনের খুশি হতে চাওয়া কেউ",
      "- এমন কেউ যাকে আপনি চেনেন",
    ],
  },
  english: {
    GREETINGS: [
      "Hello!",
      "Hi!",
      "Hey!",
      "Good day!",
      "Greetings!",
      "Howdy!",
      "Hola!",
      "Bonjour!",
      "Ciao!",
      "Namaste!",
      "Salaam!",
      "Yo!",
      "What's up!",
      "Hiya!",
      "Hey there!",
      "Good morning!",
      "Good afternoon!",
      "Good evening!",
      "Salutations!",
      "Hi-ya!",
      "Ahoy!",
      "How's it going?",
      "Sup!",
      "Hola amigo!",
      "Hello there!",
    ],
    WISHES: [
      "Wishing you a lot of success!",
      "May your dreams come true!",
      "Here's to your bright future!",
      "May happiness follow you everywhere!",
      "Wishing you endless joy and prosperity!",
      "Good luck with everything ahead!",
      "May you achieve all your goals!",
      "Wishing you strength and determination!",
      "May success be your constant companion!",
      "Here's to a future full of achievements!",
      "May you always find success in your endeavors!",
      "Wishing you a lifetime of happiness and success!",
      "Good fortune and success are yours for the taking!",
      "May you be blessed with endless opportunities!",
      "Here's wishing you an exciting and successful journey ahead!",
      "Wishing you all the best in everything you do!",
      "May you conquer all challenges that come your way!",
      "Good luck and prosperity in all your future endeavors!",
      "Wishing you good health, happiness, and success!",
      "May your hard work be rewarded with great success!",
      "Wishing you a bright and prosperous future ahead!",
      "May your path be filled with success and happiness!",
      "Here's to new beginnings and endless possibilities!",
      "Wishing you nothing but the best in all that you do!",
      "May each day bring you closer to your dreams!",
      "Here's to a future full of success, love, and joy!",
      "May you shine in everything you do!",
      "Sending you best wishes for a successful journey ahead!",
    ],
    QUESTIONS: [
      "What's the biggest lie you've ever told?",
      "Have you ever had a crush on someone you shouldn't have?",
      "What's something you've done that you're ashamed of?",
      "Have you ever broken someone's heart?",
      "What's a secret you've never told anyone?",
      "What's your biggest fear?",
      "What's the worst thing you've ever done at work?",
      "Have you ever cheated in a relationship?",
      "What's something you're embarrassed about?",
      "What's a habit you've tried to break but couldn't?",
      "Have you ever betrayed a friend?",
      "What's a lie you tell most people?",
      "What's the most childish thing you still do?",
      "What's a decision you regret?",
      "What's the biggest risk you've ever taken?",
      "Have you ever stolen something?",
      "What's the one thing you'd change about yourself?",
      "What's something you would never do even for a million dollars?",
      "What's something you're insecure about?",
      "What's the last thing you Googled?",
      "Have you ever had an embarrassing moment in front of a crush?",
      "What's the most awkward thing you've ever said to someone?",
      "What's your biggest pet peeve?",
      "What's something you've done that others would find shocking?",
      "Have you ever judged someone unfairly?",
      "What's a time you've failed but pretended you succeeded?",
      "What's your most embarrassing childhood memory?",
      "What's the biggest mistake you've ever made in a relationship?",
      "What's a thing you wish you could change about your past?",
      "Have you ever had a secret relationship?",
      "What's the most awkward situation you've ever been in?",
      "What's something you've lied about to your friends?",
      "What's a talent you have that no one knows about?",
      "What's a fear you have that you've never shared?",
      "What's something you've always wanted to do but never dared?",
      "What's a decision you made that turned out to be completely wrong?",
      "Have you ever kept something from your best friend?",
      "What's a bad habit you can't seem to break?",
      "Have you ever blamed someone else for your mistake?",
      "What's the strangest thing you've ever done in public?",
      "What's a mistake you've made that you'll never forget?",
    ],
    SIGNATURES: [
      "- Your secret admirer",
      "- Someone you know",
      "- A friend",
      "- An anonymous well-wisher",
      "- A mystery admirer",
      "- A concerned stranger",
      "- Your biggest fan",
      "- An old acquaintance",
      "- Your secret supporter",
      "- A curious soul",
      "- Someone thinking of you",
      "- Your admirer from afar",
      "- A distant friend",
      "- A silent well-wisher",
      "- Someone who's watching over you",
      "- Your secret ally",
      "- A quiet admirer",
      "- A friend in the shadows",
      "- Someone who cares",
      "- Your silent friend",
      "- A friend who believes in you",
      "- Your biggest cheerleader",
      "- An anonymous helper",
      "- A kind stranger",
      "- Your unknown supporter",
      "- A hidden fan",
      "- Someone who's rooting for you",
    ],
  },
};

class ChithiService {
  constructor(userAgent) {
    this.baseUrl = "https://chithi.pockethost.io";
    this.userAgent = userAgent;
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        "Content-Type": "application/json",
        "User-Agent":
          userAgent ||
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      },
    });
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
    if (!username) {
      throw new Error("A username is required!");
    }
    if (content.length < 5) {
      throw new Error("Letter too short!");
    }

    const isValidTheme = this.validateTheme(theme);

    if (!isValidTheme) {
      throw new Error(
        `${theme} is not a valid theme. Avaiable themes are ${this.getThemes().join(
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
        user_agent: this.userAgent
          ? this.userAgent
          : "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
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
        avatar: `https://chithi.pockethost.io/api/files/${response.data.collectionId}/${response.data.id}/${response.data.avatar}?thumb=300x300f`,
      };
    } catch (error) {
      throw new Error(`Failed to get user info: ${error.message}`);
    }
  }

  _randomPick(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  getThemes() {
    return Object.keys(THEMES).map((key) => key);
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
