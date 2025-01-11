# ChithiService Documentation

## Overview
`ChithiService` is a Node.js package that provides a way to generate and send personalized letters, as well as manage themes and user information. It interacts with a remote server to perform these operations and supports data compression for efficient communication.

### Key Features
- Generate customizable letters based on language templates.
- Maintain edit history for letters.
- Send letters with personalized content and metadata.
- Validate and manage themes.
- Compress and decompress data for server communication.

### Installation
```bash
git clone https://github.com/lifeisallboutsegs/Chithi.me.git
```

### Dependencies
This package requires the following dependencies:
- `lz-string`: For compressing and decompressing data.
- `axios`: For making HTTP requests.
- A `data.js` file containing `TEMPLATES` and `THEMES` for letters and themes.
- `wurfl.js`: For detecting device information, such as `form_factor`.

---

## Usage

### Importing the Package
```javascript
const { ChithiService } = require('chithi-service');
```

### Initializing the Service
```javascript
const chithiService = new ChithiService("Custom User-Agent");
```
- `userAgent` *(optional)*: A custom user agent string for HTTP requests.

---

## API Reference

### `generateLetter(language = "english")`
Generates a letter using predefined templates.

#### Parameters:
- `language` *(string)*: Optional. Language of the letter. Defaults to "english". Available languages are defined in the `TEMPLATES`.

#### Returns:
- *(string)*: The generated letter content.

#### Example:
```javascript
const letter = chithiService.generateLetter("english");
console.log(letter);
```

---

### `generateHistory(content)`
Creates an edit history for the given letter content.

#### Parameters:
- `content` *(string)*: The letter content.

#### Returns:
- *(Array)*: An array representing the edit history, showing character insertions and deletions.

#### Example:
```javascript
const history = chithiService.generateHistory("Hello, world!");
console.log(history);
```

---

### `sendLetter({ content, username, theme = "vintage", information = {} })`
Sends a letter to a specific user.

#### Parameters:
- `content` *(string)*: The letter content. **Minimum length is 5 characters.**
- `username` *(string)*: The recipient's username. **This is required.**
- `theme` *(string)*: Optional. The theme for the letter. Defaults to "vintage". Themes must be one of the available themes in `THEMES`.
- `information` *(object)*: Optional. Metadata about the device or user. Users can modify or add the following fields:
  - `complete_device_name` *(string)*: The name of the device. Default is "Google Chrome".
  - `form_factor` *(string)*: The device type detected using `wurfl.js`. Possible values are:
    - `Desktop`
    - `Smartphone`
    - `Tablet`
    - `Feature Phone`
    - `Smart-TV`
    - `Robot`
    - `Other`
    - `Unknown`
  - `is_mobile` *(boolean)*: Whether the device is mobile. Default is `false`.
  - `resolution` *(string)*: The screen resolution. Default is "900x1440".
  - `user_agent` *(string)*: The browser user agent string. Defaults to the user agent provided during initialization or a standard browser user agent.

#### Returns:
- *(object)*: The server's response containing the result of the letter submission.

#### Throws:
- `Error` if required fields are missing or invalid.

#### Example:
```javascript
try {
  const response = await chithiService.sendLetter({
    content: "Hello, how are you?",
    username: "exampleUser",
    theme: "modern",
    information: {
      complete_device_name: "Firefox",
      form_factor: "Smartphone",
      is_mobile: true,
      resolution: "1366x768",
    },
  });
  console.log("Letter sent successfully!", response);
} catch (error) {
  console.error("Error sending letter:", error.message);
}
```

---

### `getUserInfo(username)`
Retrieves information about a user from the server.

#### Parameters:
- `username` *(string)*: The username to fetch information for.

#### Returns:
- *(object)*: User information, including fields such as:
  - `id` *(string)*: The user's unique ID.
  - `collectionId` *(string)*: The user's collection ID.
  - `avatar` *(string)*: URL of the user's avatar image.

#### Example:
```javascript
const userInfo = await chithiService.getUserInfo("exampleUser");
console.log(userInfo);
```

---

### `getThemes()`
Retrieves all available themes.

#### Returns:
- *(Array)*: An array of theme names, e.g., `["vintage", "modern", "classic"]`.

#### Example:
```javascript
const themes = chithiService.getThemes();
console.log(themes);
```

---

### `validateTheme(theme)`
Checks if a theme is valid.

#### Parameters:
- `theme` *(string)*: The theme name to validate.

#### Returns:
- *(boolean)*: `true` if the theme exists, `false` otherwise.

#### Example:
```javascript
const isValid = chithiService.validateTheme("modern");
console.log(isValid);
```

---

### `decompressLetter(compressedData)`
Decompresses a letter from its compressed format.

#### Parameters:
- `compressedData` *(string)*: Compressed letter data in Base64 format.

#### Returns:
- *(object)*: The decompressed letter data containing fields like `content`, `user`, `theme`, and `information`.

#### Throws:
- `Error` if decompression fails.

#### Example:
```javascript
const decompressedData = chithiService.decompressLetter(compressedData);
console.log(decompressedData);
```

---

## Example Workflow

```javascript
const { ChithiService } = require('chithi-service');
const chithiService = new ChithiService("Custom User-Agent");

(async () => {
  try {
    // Generate a letter
    const letter = chithiService.generateLetter("english");

    // Send the letter
    const response = await chithiService.sendLetter({
      content: letter,
      username: "exampleUser",
      theme: "classic",
      information: {
        complete_device_name: "Safari",
        form_factor: "Tablet",
        is_mobile: true,
        resolution: "768x1024",
        user_agent: "Custom/5.0 (Tablet; U; OS 15)"
      },
    });

    console.log("Letter sent successfully!", response);
  } catch (error) {
    console.error("An error occurred:", error.message);
  }
})();
```

---

## License
This package is available under the [MIT License](LICENSE).

