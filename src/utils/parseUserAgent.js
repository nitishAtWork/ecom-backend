const { UAParser } = require("ua-parser-js");

const parseUserAgent = (userAgent = "") => {
  if (!userAgent || typeof userAgent !== "string") {
    return {
      browser: "Unknown Browser",
      browserVersion: "",
      os: "Unknown OS",
      osVersion: "",
      device: "Unknown Device",
      deviceType: "unknown",
      userAgent: "",
    };
  }

  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  const browser = result.browser.name || "Unknown Browser";
  const browserVersion = result.browser.version || "";

  const os = result.os.name || "Unknown OS";
  const osVersion = result.os.version || "";

  const deviceType = result.device.type || "desktop";

  let device = "Desktop";

  if (deviceType === "mobile") {
    device = "Mobile";
  } else if (deviceType === "tablet") {
    device = "Tablet";
  } else if (deviceType === "wearable") {
    device = "Wearable";
  } else if (deviceType === "console") {
    device = "Game Console";
  } else if (deviceType === "smarttv") {
    device = "Smart TV";
  }

  return {
    browser,
    browserVersion,
    os,
    osVersion,
    device,
    deviceType,
    userAgent,
  };
};

module.exports = parseUserAgent;