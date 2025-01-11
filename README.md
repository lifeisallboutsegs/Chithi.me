# ChithiService

ChithiService is a Node.js package designed to create and send personalized letters with user and device metadata. This service interacts with a remote server and uses data compression for efficient communication.

## Features

- **Customizable Letters**: Generate letters in different languages using templates.
- **Edit History**: Maintain a detailed edit history of letters.
- **Theme Support**: Send letters with predefined themes.
- **User Metadata**: Customize device and user metadata.
- **Data Compression**: Compress and decompress data for efficient server communication.

## Installation

Install the package using git:

```bash
git install https://github.com/lifeisallboutsegs/Chithi.me.git
```

## Usage

### Importing the Package

```javascript
const { ChithiService } = require('./chithi.js');
```

### Initializing ChithiService

```javascript
const chithiService = new ChithiService("Custom User-Agent");
```
- **`userAgent`** (optional): Custom user agent string for HTTP requests. Defaults to a standard browser user agent if not provided.

## Examples

### Generate a Letter

```javascript
const letter = chithiService.generateLetter("english");
console.log(letter);
```

### Send a Letter

```javascript
try {
  const response = await chithiService.sendLetter({
    content: "Hello, how are you?",
    username: "exampleUser",
    theme: "modern",
    information: {
      complete_device_name: "Safari",
      form_factor: "Tablet",
      is_mobile: true,
      resolution: "768x1024",
      user_agent: "Custom/5.0 (Tablet; U; OS 15)",
    },
  });

  console.log("Letter sent successfully!", response);
} catch (error) {
  console.error("Error sending letter:", error.message);
}
```

### Retrieve User Information

```javascript
const userInfo = await chithiService.getUserInfo("exampleUser");
console.log(userInfo);
```

### Validate a Theme

```javascript
const isValid = chithiService.validateTheme("modern");
console.log(isValid ? "Theme is valid" : "Theme is not valid");
```

### Decompress Letter Data

```javascript
const decompressedData = chithiService.decompressLetter(compressedData);
console.log(decompressedData);
```

## Metadata Options

The `information` parameter in the `sendLetter` method allows customization of metadata, including:

- **`complete_device_name`** *(string)*: Device name, e.g., "Google Chrome" or "Safari".
- **`form_factor`** *(string)*: Device type, one of the following:
  - `Desktop`
  - `Laptop`
  - `Tablet`
  - `Smartphone`
  - `Mobile`
- **`is_mobile`** *(boolean)*: `true` if the device is mobile; otherwise, `false`.
- **`resolution`** *(string)*: Screen resolution, e.g., "1366x768".
- **`user_agent`** *(string)*: User agent string for the device.

## Available Themes

Use `chithiService.getThemes()` to retrieve a list of available themes, such as `"vintage"`, `"modern"`, or `"classic"`.

## License

This package is licensed under the [MIT License](LICENSE).

## Contributing

Contributions are welcome! Please open an issue or submit a pull request to suggest changes or improvements.

