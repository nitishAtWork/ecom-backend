const OurPresence = require("../models/OurPresence");
const Country = require("../models/Country");
const State = require("../models/State");
const City = require("../models/City");

const {
    deleteUploadedFile,
} = require("../utils/file");


// =====================================================
// UPDATE SINGLE OUR PRESENCE
// =====================================================

const updateOurPresence = async (
    req,
    res,
    next
) => {
    const newUploadedFiles = [];

    try {
        /*
        |--------------------------------------------------------------------------
        | GET EXISTING RECORD
        |--------------------------------------------------------------------------
        */

        const existingOurPresence =
            await OurPresence.findOne();

        if (!existingOurPresence) {
            return res.status(404).json({
                success: false,
                message:
                    "Our Presence record not found.",
            });
        }

        /*
        |--------------------------------------------------------------------------
        | NORMAL BODY DATA
        |--------------------------------------------------------------------------
        */

        const updateData = {
            ...req.body,
        };

        /*
         * Images are handled by multer.
         * Never allow req.body image values
         * to reach MongoDB.
         */

        delete updateData.img;
        delete updateData.images;

        let shouldRemoveMainImage = false;

        if (
            req.body.removeMainImage !==
            undefined
        ) {
            shouldRemoveMainImage =
                req.body.removeMainImage ===
                "true";
        }

        delete updateData.removeMainImage;


        /*
 |--------------------------------------------------------------------------
 | REMOVE IMAGES
 |--------------------------------------------------------------------------
 */

        let removeImages = [];

        if (
            req.body.removeImages !==
            undefined
        ) {
            removeImages =
                req.body.removeImages;

            /*
             * Multipart/form-data sends arrays
             * as JSON strings.
             */

            if (
                typeof removeImages ===
                "string"
            ) {
                try {
                    removeImages =
                        JSON.parse(
                            removeImages
                        );
                } catch {
                    removeImages = [
                        removeImages,
                    ];
                }
            }

            if (
                !Array.isArray(
                    removeImages
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "removeImages must be an array.",
                });
            }

            /*
            |--------------------------------------------------------------------------
            | NORMALIZE IMAGE PATHS
            |--------------------------------------------------------------------------
            |
            | Frontend may send:
            |
            | https://domain.com/uploads/ourpresence/image.png
            |
            | or:
            |
            | /uploads/ourpresence/image.png
            |
            | MongoDB stores only the second format.
            |
            */

            removeImages =
                removeImages
                    .filter(
                        (image) =>
                            typeof image ===
                            "string" &&
                            image.trim() !== ""
                    )
                    .map((image) => {
                        let normalized =
                            image.trim();

                        /*
                         * Remove BASE_URL
                         */

                        if (
                            process.env.BASE_URL &&
                            normalized.startsWith(
                                process.env.BASE_URL
                            )
                        ) {
                            normalized =
                                normalized.slice(
                                    process.env.BASE_URL
                                        .length
                                );
                        }

                        /*
                         * Make sure path starts
                         * with /
                         */

                        if (
                            !normalized.startsWith(
                                "/"
                            )
                        ) {
                            normalized =
                                `/${normalized}`;
                        }

                        return normalized;
                    });
        }

        /*
         * Never save removeImages
         * inside MongoDB.
         */

        delete updateData.removeImages;


        /*
        |--------------------------------------------------------------------------
        | EXISTING GALLERY IMAGES
        |--------------------------------------------------------------------------
        */

        const oldImages =
            Array.isArray(
                existingOurPresence.images
            )
                ? existingOurPresence.images
                : [];

        /*
         * Keep images that were NOT removed.
         */

        const remainingImages =
            oldImages.filter(
                (image) =>
                    !removeImages.includes(
                        image
                    )
            );



        /*
            |--------------------------------------------------------------------------
            | MAIN IMAGE
            |--------------------------------------------------------------------------
            */

        let oldMainImageToDelete = null;

        if (
            req.files?.img &&
            Array.isArray(req.files.img) &&
            req.files.img.length > 0
        ) {
            const uploadedFile =
                req.files.img[0];

            const newMainImage =
                `/uploads/ourpresence/${uploadedFile.filename}`;

            updateData.img =
                newMainImage;

            newUploadedFiles.push(
                newMainImage
            );

            if (existingOurPresence.img) {
                oldMainImageToDelete =
                    existingOurPresence.img;
            }
        } else if (
            shouldRemoveMainImage &&
            existingOurPresence.img
        ) {
            updateData.img = "";

            oldMainImageToDelete =
                existingOurPresence.img;
        }


        /*
        |--------------------------------------------------------------------------
        | NEW ADDITIONAL IMAGES
        |--------------------------------------------------------------------------
        */

        let newImages = [];

        if (
            req.files?.images &&
            Array.isArray(
                req.files.images
            ) &&
            req.files.images.length > 0
        ) {
            newImages =
                req.files.images.map(
                    (file) =>
                        `/uploads/ourpresence/${file.filename}`
                );

            newUploadedFiles.push(
                ...newImages
            );
        }


        /*
        |--------------------------------------------------------------------------
        | FINAL IMAGE LIST
        |--------------------------------------------------------------------------
        |
        | Existing images
        |       +
        | New images
        |
        */

        if (
            removeImages.length > 0 ||
            newImages.length > 0
        ) {
            updateData.images = [
                ...remainingImages,
                ...newImages,
            ];
        }


        /*
     |--------------------------------------------------------------------------
     | UPDATE DATABASE
     |--------------------------------------------------------------------------
     */

        const updatedOurPresence =
            await OurPresence.findByIdAndUpdate(
                existingOurPresence._id,
                {
                    $set: updateData,
                },
                {
                    new: true,
                    runValidators: true,
                }
            );


        /*
        |--------------------------------------------------------------------------
        | DELETE OLD MAIN IMAGE
        |--------------------------------------------------------------------------
        */

        if (oldMainImageToDelete) {
            await deleteUploadedFile(
                oldMainImageToDelete
            );
        }


        /*
        |--------------------------------------------------------------------------
        | DELETE REMOVED GALLERY IMAGES
        |--------------------------------------------------------------------------
        */

        if (
            removeImages.length > 0
        ) {
            for (
                const image of removeImages
            ) {
                await deleteUploadedFile(
                    image
                );
            }
        }


        /*
        |--------------------------------------------------------------------------
        | SUCCESS
        |--------------------------------------------------------------------------
        */

        return res.status(200).json({
            success: true,

            message:
                "Our Presence updated successfully.",

            data: {
                ourPresence:
                    updatedOurPresence,
            },
        });

       
    } catch (error) {
        /*
        |--------------------------------------------------------------------------
        | CLEANUP NEW FILES
        |--------------------------------------------------------------------------
        |
        | If database update fails after
        | multer already uploaded files,
        | remove those newly uploaded files.
        |
        */

        if (
            newUploadedFiles.length > 0
        ) {
            try {
                for (
                    const file of
                    newUploadedFiles
                ) {
                    await deleteUploadedFile(
                        file
                    );
                }
            } catch (
            cleanupError
            ) {
                console.error(
                    "Failed to cleanup uploaded Our Presence files:",
                    cleanupError
                );
            }
        }

        next(error);
    }
};


// =====================================================
// GET ADMIN OUR PRESENCE
// =====================================================

const getOurPresence = async (
    req,
    res,
    next
) => {
    try {
        let data =
            await OurPresence.findOne();

        /*
        |--------------------------------------------------------------------------
        | CREATE SINGLETON IF NOT EXISTS
        |--------------------------------------------------------------------------
        */

        if (!data) {
            data =
                await OurPresence.create({
                    name: "",
                    shortDescription: "",
                    description: "",
                    extraDescription: "",
                    img: "",
                    images: [],
                    metaTitle: "",
                    metaDescription: "",
                    metaKeywords: "",
                });
        }

        const result =
            data.toObject();


        /*
        |--------------------------------------------------------------------------
        | MAIN IMAGE
        |--------------------------------------------------------------------------
        */

        result.img = result.img
            ? `${process.env.BASE_URL}${result.img}`
            : "";


        /*
        |--------------------------------------------------------------------------
        | ADDITIONAL IMAGES
        |--------------------------------------------------------------------------
        */

        result.images =
            Array.isArray(
                result.images
            )
                ? result.images
                    .filter(Boolean)
                    .map(
                        (image) =>
                            `${process.env.BASE_URL}${image}`
                    )
                : [];


        return res.status(200).json({
            success: true,

            message:
                "Data fetched successfully",

            ourPresence: result,
        });
    } catch (error) {
        console.error(
            "Unable to fetch Our Presence:",
            error
        );

        next(error);
    }
};


// =====================================================
// FRONTEND OUR PRESENCE
// =====================================================

const ourPresenceFrontend = async (
    req,
    res,
    next
) => {
    try {
        const reqSlug =
            (
                req.params.slug || ""
            )
                .trim()
                .toLowerCase();


        /*
        |--------------------------------------------------------------------------
        | GET OUR PRESENCE
        |--------------------------------------------------------------------------
        */

        const doc =
            await OurPresence.findOne()
                .select(
                    "-isActive -createdAt -updatedAt"
                )
                .lean();

        if (!doc) {
            return res.status(404).json({
                success: false,
                message:
                    "Our Presence content not found",
            });
        }


        /*
        |--------------------------------------------------------------------------
        | FIND LOCATION
        |--------------------------------------------------------------------------
        */

        let slugData =
            await Country.findOne({
                slug: reqSlug,
                isActive: true,
            }).lean();

        let locationType =
            "country";


        if (!slugData) {
            slugData =
                await State.findOne({
                    slug: reqSlug,
                    isActive: true,
                }).lean();

            locationType =
                "state";
        }


        if (!slugData) {
            slugData =
                await City.findOne({
                    slug: reqSlug,
                    isActive: true,
                }).lean();

            locationType =
                "city";
        }


        if (!slugData) {
            return res.status(404).json({
                success: false,
                message:
                    "Location doesn't exist",
            });
        }


        /*
        |--------------------------------------------------------------------------
        | CREATE RESPONSE OBJECT
        |--------------------------------------------------------------------------
        */

        const data = {
            ...doc,
        };


        /*
        |--------------------------------------------------------------------------
        | REPLACE SUBDOMAIN
        |--------------------------------------------------------------------------
        */

        const replaceSubdomain = (
            value
        ) => {
            if (
                typeof value !==
                "string"
            ) {
                return value;
            }

            return value.replace(
                /subdomain/gi,
                slugData.name
            );
        };


        data.name =
            replaceSubdomain(
                data.name
            );

        data.shortDescription =
            replaceSubdomain(
                data.shortDescription
            );

        data.description =
            replaceSubdomain(
                data.description
            );

        data.extraDescription =
            replaceSubdomain(
                data.extraDescription
            );

        data.metaTitle =
            replaceSubdomain(
                data.metaTitle
            );

        data.metaDescription =
            replaceSubdomain(
                data.metaDescription
            );

        data.metaKeywords =
            replaceSubdomain(
                data.metaKeywords
            );


        /*
        |--------------------------------------------------------------------------
        | MAIN IMAGE
        |--------------------------------------------------------------------------
        */

        data.img = data.img
            ? `${process.env.BASE_URL}${data.img}`
            : "";


        /*
        |--------------------------------------------------------------------------
        | ADDITIONAL IMAGES
        |--------------------------------------------------------------------------
        */

        data.images =
            Array.isArray(
                data.images
            )
                ? data.images
                    .filter(Boolean)
                    .map(
                        (image) =>
                            `${process.env.BASE_URL}${image}`
                    )
                : [];


        /*
        |--------------------------------------------------------------------------
        | LOCATION
        |--------------------------------------------------------------------------
        */

        data.location = {
            _id:
                slugData._id,
            name:
                slugData.name,
            slug:
                slugData.slug,
            type:
                locationType,
        };


        /*
        |--------------------------------------------------------------------------
        | RESPONSE
        |--------------------------------------------------------------------------
        */

        return res.status(200).json({
            success: true,

            message:
                "Data fetched successfully",

            data,
        });
    } catch (error) {
        console.error(
            "Unable to fetch Our Presence:",
            error
        );

        next(error);
    }
};


module.exports = {
    updateOurPresence,
    getOurPresence,
    ourPresenceFrontend,
};