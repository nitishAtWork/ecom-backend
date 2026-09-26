const Website = require("../models/Website");
const BASE_URL = (
    process.env.BASE_URL ||
    ""
).replace(/\/$/, "");
const {
  deleteUploadedFile,
} = require("../utils/file");

/*
|--------------------------------------------------------------------------
| Get uploaded filename
|--------------------------------------------------------------------------
*/

const getUploadedFileName = (
  files,
  fieldName
) => {
  if (
    files &&
    files[fieldName] &&
    Array.isArray(files[fieldName]) &&
    files[fieldName][0]
  ) {
    return files[fieldName][0].filename;
  }

  return null;
};


/*
|--------------------------------------------------------------------------
| Get Website upload path
|--------------------------------------------------------------------------
|
| MongoDB stores:
|
| /uploads/website/file.jpg
|
| But deleteUploadedFile() needs:
|
| uploads/website/file.jpg
|
*/

const getWebsiteFilePath = (
  file
) => {
  if (!file) {
    return null;
  }

  /*
   * If database already contains:
   *
   * /uploads/website/example.jpg
   *
   * remove the leading slash.
   */
  if (
    file.startsWith(
      "/uploads/website/"
    )
  ) {
    return file.substring(1);
  }

  /*
   * If database contains:
   *
   * uploads/website/example.jpg
   */
  if (
    file.startsWith(
      "uploads/website/"
    )
  ) {
    return file;
  }

  /*
   * Backward compatibility:
   *
   * Older records may contain only:
   *
   * example.jpg
   */
  return `uploads/website/${file}`;
};


/*
|--------------------------------------------------------------------------
| Delete newly uploaded website files
|--------------------------------------------------------------------------
*/

const cleanupUploadedWebsiteFiles =
  async ({
    logo = null,
    favicon = null,
  } = {}) => {
    if (logo) {
      await deleteUploadedFile(
        getWebsiteFilePath(logo)
      ).catch((error) => {
        console.error(
          "Failed to cleanup uploaded logo:",
          error.message
        );
      });
    }

    if (favicon) {
      await deleteUploadedFile(
        getWebsiteFilePath(favicon)
      ).catch((error) => {
        console.error(
          "Failed to cleanup uploaded favicon:",
          error.message
        );
      });
    }
  };


/*
|--------------------------------------------------------------------------
| POST /api/website
|--------------------------------------------------------------------------
*/

const createWebsiteInfo = async (
  req,
  res
) => {
  let uploadedLogo = null;
  let uploadedFavicon = null;

  try {
    /*
     * Only one website configuration
     * is allowed.
     */
    const existingWebsite =
      await Website.findOne().lean();

    /*
     * IMPORTANT:
     *
     * Multer has already uploaded the
     * files before this controller runs.
     *
     * Therefore cleanup them before
     * returning 409.
     */
    if (existingWebsite) {
      uploadedLogo =
        getUploadedFileName(
          req.files,
          "logo"
        );

      uploadedFavicon =
        getUploadedFileName(
          req.files,
          "favicon"
        );

      await cleanupUploadedWebsiteFiles({
        logo: uploadedLogo,
        favicon: uploadedFavicon,
      });

      return res.status(409).json({
        success: false,
        message:
          "Website information already exists. Please update the existing website information.",
      });
    }


    /*
     * Get uploaded files
     */
    const logo =
      getUploadedFileName(
        req.files,
        "logo"
      );

    const favicon =
      getUploadedFileName(
        req.files,
        "favicon"
      );

    uploadedLogo = logo;
    uploadedFavicon = favicon;


    /*
     * Logo required
     */
    if (!logo) {
      await cleanupUploadedWebsiteFiles({
        logo: uploadedLogo,
        favicon: uploadedFavicon,
      });

      return res.status(400).json({
        success: false,
        message: "Logo is required.",
      });
    }


    /*
     * Favicon required
     */
    if (!favicon) {
      await cleanupUploadedWebsiteFiles({
        logo: uploadedLogo,
        favicon: uploadedFavicon,
      });

      return res.status(400).json({
        success: false,
        message: "Favicon is required.",
      });
    }


    const {
      name,
      tagLine,
      googleMap,
      footerText,
      copyrightText,

      primaryEmail,
      secondaryEmail,
      thirdEmail,
      fourthEmail,

      primaryPhone,
      secondaryPhone,
      thirdPhone,
      fourthPhone,

      primaryAddress,
      secondaryAddress,
      thirdAddress,
      fourthAddress,

      facebook,
      linkedin,
      twitter,
      instagram,
      pinterest,
      youtube,
      tumblr,
      whatsapp,

      domain,
      googleAnalytics,
      googleSearchConsole,

      robots,
      panIndia,
      apiId,
    } = req.body;


    /*
     * Required fields
     */

    if (!name) {
      await cleanupUploadedWebsiteFiles({
        logo: uploadedLogo,
        favicon: uploadedFavicon,
      });

      return res.status(400).json({
        success: false,
        message:
          "Website name is required.",
      });
    }


    if (!primaryEmail) {
      await cleanupUploadedWebsiteFiles({
        logo: uploadedLogo,
        favicon: uploadedFavicon,
      });

      return res.status(400).json({
        success: false,
        message:
          "Primary email is required.",
      });
    }


    if (!primaryPhone) {
      await cleanupUploadedWebsiteFiles({
        logo: uploadedLogo,
        favicon: uploadedFavicon,
      });

      return res.status(400).json({
        success: false,
        message:
          "Primary phone is required.",
      });
    }


    if (!primaryAddress) {
      await cleanupUploadedWebsiteFiles({
        logo: uploadedLogo,
        favicon: uploadedFavicon,
      });

      return res.status(400).json({
        success: false,
        message:
          "Primary address is required.",
      });
    }


    /*
     * IMPORTANT:
     *
     * Store the same relative path
     * pattern as Products.
     */
    const websiteInfo =
      await Website.create({
        name,
        tagLine,

        logo:
          `/uploads/website/${logo}`,

        favicon:
          `/uploads/website/${favicon}`,

        googleMap,
        footerText,
        copyrightText,

        primaryEmail,
        secondaryEmail,
        thirdEmail,
        fourthEmail,

        primaryPhone,
        secondaryPhone,
        thirdPhone,
        fourthPhone,

        primaryAddress,
        secondaryAddress,
        thirdAddress,
        fourthAddress,

        facebook,
        linkedin,
        twitter,
        instagram,
        pinterest,
        youtube,
        tumblr,
        whatsapp,

        domain,
        googleAnalytics,
        googleSearchConsole,

        robots:
          robots === undefined ||
          robots === ""
            ? true
            : robots === true ||
              robots === "true",

        panIndia:
          panIndia === true ||
          panIndia === "true",

        apiId,
      });


    /*
     * DB creation successful.
     *
     * Do NOT delete logo/favicon here.
     */
    uploadedLogo = null;
    uploadedFavicon = null;


    return res.status(201).json({
      success: true,
      message:
        "Website information created successfully.",

      websiteInfo,
    });

  } catch (error) {

    console.error(
      "Create website info error:",
      error
    );


    /*
     * DB creation failed.
     *
     * Remove files that were uploaded
     * for this request.
     */
    await cleanupUploadedWebsiteFiles({
      logo: uploadedLogo,
      favicon: uploadedFavicon,
    });


    /*
     * Mongoose validation
     */
    if (
      error.name ===
      "ValidationError"
    ) {
      const errors =
        Object.values(
          error.errors
        ).map(
          (err) => err.message
        );

      return res.status(400).json({
        success: false,
        message:
          "Validation failed.",
        errors,
      });
    }


    return res.status(500).json({
      success: false,
      message:
        "Server error while creating website information.",
    });
  }
};


/*
|--------------------------------------------------------------------------
| PUT /api/website
|--------------------------------------------------------------------------
*/

const updateWebsiteInfo = async (
  req,
  res
) => {
  let newLogo = null;
  let newFavicon = null;

  try {

    /*
     * Get existing website
     */
    const websiteInfo =
      await Website.findOne();

    if (!websiteInfo) {
      return res.status(404).json({
        success: false,
        message:
          "Website information does not exist. Please create it first.",
      });
    }


    const {
      name,
      tagLine,
      googleMap,
      footerText,
      copyrightText,

      primaryEmail,
      secondaryEmail,
      thirdEmail,
      fourthEmail,

      primaryPhone,
      secondaryPhone,
      thirdPhone,
      fourthPhone,

      primaryAddress,
      secondaryAddress,
      thirdAddress,
      fourthAddress,

      facebook,
      linkedin,
      twitter,
      instagram,
      pinterest,
      youtube,
      tumblr,
      whatsapp,

      domain,
      googleAnalytics,
      googleSearchConsole,

      robots,
      panIndia,
      apiId,
    } = req.body;


    const updateData = {};


    /*
     * Normal fields
     */

    const fields = {
      name,
      tagLine,
      googleMap,
      footerText,
      copyrightText,

      primaryEmail,
      secondaryEmail,
      thirdEmail,
      fourthEmail,

      primaryPhone,
      secondaryPhone,
      thirdPhone,
      fourthPhone,

      primaryAddress,
      secondaryAddress,
      thirdAddress,
      fourthAddress,

      facebook,
      linkedin,
      twitter,
      instagram,
      pinterest,
      youtube,
      tumblr,
      whatsapp,

      domain,
      googleAnalytics,
      googleSearchConsole,

      apiId,
    };


    Object.entries(fields).forEach(
      ([key, value]) => {
        if (
          value !== undefined
        ) {
          updateData[key] =
            value;
        }
      }
    );


    /*
     * Boolean fields
     */

    if (
      robots !== undefined
    ) {
      updateData.robots =
        robots === true ||
        robots === "true";
    }


    if (
      panIndia !== undefined
    ) {
      updateData.panIndia =
        panIndia === true ||
        panIndia === "true";
    }


    /*
     * New Logo
     */

    if (
      req.files?.logo?.[0]
    ) {
      newLogo =
        req.files.logo[0].filename;

      updateData.logo =
        `/uploads/website/${newLogo}`;
    }


    /*
     * New Favicon
     */

    if (
      req.files?.favicon?.[0]
    ) {
      newFavicon =
        req.files.favicon[0].filename;

      updateData.favicon =
        `/uploads/website/${newFavicon}`;
    }


    /*
     * Nothing to update
     */

    if (
      Object.keys(updateData)
        .length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "No data provided for update.",
      });
    }


    /*
     * Update database
     */

    const updatedWebsite =
      await Website.findByIdAndUpdate(
        websiteInfo._id,

        {
          $set: updateData,
        },

        {
          new: true,
          runValidators: true,
        }
      );


    if (!updatedWebsite) {
      await cleanupUploadedWebsiteFiles({
        logo: newLogo,
        favicon: newFavicon,
      });

      return res.status(500).json({
        success: false,
        message:
          "Failed to update website information.",
      });
    }


    /*
     * Database update succeeded.
     *
     * Now remove OLD logo.
     */

    if (
      newLogo &&
      websiteInfo.logo &&
      websiteInfo.logo !==
        updateData.logo
    ) {
      await deleteUploadedFile(
        getWebsiteFilePath(
          websiteInfo.logo
        )
      ).catch((error) => {
        console.error(
          "Failed to delete old logo:",
          error.message
        );
      });
    }


    /*
     * Remove OLD favicon.
     */

    if (
      newFavicon &&
      websiteInfo.favicon &&
      websiteInfo.favicon !==
        updateData.favicon
    ) {
      await deleteUploadedFile(
        getWebsiteFilePath(
          websiteInfo.favicon
        )
      ).catch((error) => {
        console.error(
          "Failed to delete old favicon:",
          error.message
        );
      });
    }


    /*
     * Files are now owned by the
     * database record.
     *
     * Do not cleanup them again.
     */
    newLogo = null;
    newFavicon = null;


    return res.status(200).json({
      success: true,
      message:
        "Website information updated successfully.",

      websiteInfo:
        updatedWebsite,
    });

  } catch (error) {

    console.error(
      "Update website info error:",
      error
    );


    /*
     * Database update failed.
     *
     * Remove newly uploaded files.
     *
     * IMPORTANT:
     * Do NOT remove the old files.
     */
    await cleanupUploadedWebsiteFiles({
      logo: newLogo,
      favicon: newFavicon,
    });


    /*
     * Mongoose validation error
     */

    if (
      error.name ===
      "ValidationError"
    ) {
      const errors =
        Object.values(
          error.errors
        ).map(
          (err) => err.message
        );

      return res.status(400).json({
        success: false,
        message:
          "Validation failed.",
        errors,
      });
    }


    return res.status(500).json({
      success: false,
      message:
        "Server error while updating website information.",
    });
  }
};

const getWebsiteInfo = async (req, res) => {
  try {
    const websiteInfo = await Website.findOne().lean();

    if (!websiteInfo) {
      // Create dummy data
      websiteInfo = await Website.create({
        name: "Dummy Website",
        tagLine: "This is a dummy tagline",
        logo: "logo.png", // Make sure this file exists in /images/website/
        favicon: "favicon.png", // Make sure this file exists in /images/website/
        googleMap: "",
        footerText: "Whether you're an experienced lorem ipsum dolor sit amet, consect to adipisicing elit. Ut enim ad minim veniam sed do magna aliqua. Lorem ipsum dolor sit amet consectetur adipisicing elit. Earum iste amet officiis laboriosam adipisci? Ex ea perferendis sequi delectus fuga maxime?",
        copyrightText: 'Copyright © 2026 | Website Designed &amp; Promoted By Insta Vyapar - <a href="https://www.instavyapar.com/" class="Google Promotion Services in Delhi" target="_blank">Google Promotion Services in Delhi</a> | <a href="https://www.instavyapar.com/our-services/digital-marketing/google-promotion.html" class="Google Promotion Company in India" target="_blank">Google Promotion Company in India</a>',
        primaryEmail: "dummy@example.com",
        secondaryEmail: "",
        thirdEmail: "",
        fourthEmail: "",
        primaryPhone: "+10000000001",
        secondaryPhone: "",
        thirdPhone: "",
        fourthPhone: "",
        primaryAddress: "123 Dummy Street",
        secondaryAddress: "",
        thirdAddress: "",
        fourthAddress: "",
        facebook: "https://facebook.com",
        linkedin: "https://linkedin.com/",
        twitter: "https://x.com",
        instagram: "https://instagram.com",
        pinterest: "https://pinterest.com",
        youtube: "https://youtube.com",
        tumblr: "https://tumbler.com",
        whatsapp: "+10000000001",
        domain: "https://www.domain.com",
        googleAnalytics: "G-0000000",
        googleSearchConsole: "00000000000000000000.html",
        robots: true,
        panIndia: false,
      });
      // return res.status(404).json({
      //   success: false,
      //   message: "Website information not found.",
      // });
    }

    if (websiteInfo.logo) {
      websiteInfo.logo = `${BASE_URL}${websiteInfo.logo}`;
    }

    if (websiteInfo.favicon) {
      websiteInfo.favicon = `${BASE_URL}${websiteInfo.favicon}`;
    }

    // Do not expose sensitive/internal API ID
    delete websiteInfo.apiId;

    return res.status(200).json({
      success: true,
      data:websiteInfo,
    });
  } catch (error) {
    console.error("Get website info error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching website information.",
    });
  }
};


module.exports = {
  createWebsiteInfo,
  updateWebsiteInfo,
  getWebsiteInfo,
};
