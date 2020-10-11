const axios = require("axios");
const fileStorage = require("./fileStorage");

const BRUTE_TAG = "$brute";
const ENGLISH_LETTERS = "abcdefghijklmnopqrstuvwxyz";
const ARABIC_NUMBERS = "0123456789";

const indexToString = ({ index, charset }) => {
  let accumulator = index;
  const characters = [];
  while (accumulator > 0) {
    characters.unshift(charset[accumulator % charset.length]);
    accumulator =
      (accumulator - (accumulator % charset.length)) / charset.length;
  }
  return characters.length ? characters.join("") : charset[0];
};

const formatFolderName = (text) => text.replace(/[^\w\-]+/g, "_");

const brute = async (pattern) => {
  const parts = pattern.split(BRUTE_TAG);
  const characters =
    ENGLISH_LETTERS + ENGLISH_LETTERS.toUpperCase() + ARABIC_NUMBERS;

  let currentIndex = 0;
  const patternFolder = formatFolderName(parts[0]);

  while (currentIndex <= 300) {
    const word = indexToString({ index: currentIndex, charset: characters });
    currentIndex += 1;

    const url = new URL(parts[0] + word + parts[1]);
    const fileName = `${formatFolderName(url.href)
      .replace(parts[0], "")
      .replace(parts[1], "")}`;

    const htmlFilepath = `${patternFolder}/html/${fileName}.html`;
    if (await fileStorage.hasItem(htmlFilepath)) {
      continue;
    }
    const response = await axios.get(url.href);
    await fileStorage.setItem(htmlFilepath, response.data.toString());
    const statusFilepath = `${patternFolder}/${response.status}/${fileName}.json`;
    await fileStorage.setJson(statusFilepath, {
      href: url.href,
      status: response.status,
      statusTexT: response.statusText,
    });
    console.log("resolved: ", url.href);
  }
};

brute("https://www.npmjs.com/package/$brute").catch(console.error);
