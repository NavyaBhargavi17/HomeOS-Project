const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");

const Document = require("../models/Document");
const auth = require("../middleware/auth");

const router = express.Router();

/* =========================================================
   FILE STORAGE
========================================================= */

const uploadDir = path.join(__dirname, "../uploads/documents");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/* =========================================================
   MULTER CONFIGURATION
========================================================= */

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();

    const randomName =
      crypto.randomBytes(16).toString("hex") + extension;

    cb(null, randomName);
  },
});

const allowedMimeTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
];

const upload = multer({
  storage,

  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB
  },

  fileFilter: (req, file, cb) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(
        new Error("Only PDF, JPG, and PNG files are allowed")
      );
    }

    cb(null, true);
  },
});

/* =========================================================
   GET ALL DOCUMENTS
========================================================= */

router.get("/", auth, async (req, res) => {
  try {
    const documents = await Document.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    res.json(documents);
  } catch (error) {
    console.error("Get documents error:", error);

    res.status(500).json({
      message: "Failed to fetch documents",
      error: error.message,
    });
  }
});

/* =========================================================
   CREATE DOCUMENT METADATA
   (kept for compatibility with existing frontend)
========================================================= */

router.post("/", auth, async (req, res) => {
  try {
    const {
      name,
      category,
      fileUrl,
      fileType,
      expiryDate,
      description,
    } = req.body;

    if (!name || !category) {
      return res.status(400).json({
        message: "Document name and category are required",
      });
    }

    const document = await Document.create({
      user: req.user._id,
      name: name.trim(),
      category: category.trim(),
      fileUrl: fileUrl || "",
      fileType: fileType || "",
      expiryDate: expiryDate || undefined,
      description: description || "",
    });

    res.status(201).json({
      message: "Document created successfully",
      document,
    });
  } catch (error) {
    console.error("Create document error:", error);

    res.status(500).json({
      message: "Failed to create document",
      error: error.message,
    });
  }
});

/* =========================================================
   UPLOAD DOCUMENT
========================================================= */

router.post(
  "/upload",
  auth,
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: "Please select a file to upload",
        });
      }

      const {
        name,
        category,
        expiryDate,
        description,
      } = req.body;

      if (!name || !name.trim()) {
        // Delete uploaded file if validation fails
        if (req.file.path && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }

        return res.status(400).json({
          message: "Document name is required",
        });
      }

      if (!category || !category.trim()) {
        if (req.file.path && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }

        return res.status(400).json({
          message: "Document category is required",
        });
      }

      const document = await Document.create({
        user: req.user._id,

        name: name.trim(),

        category: category.trim(),

        fileUrl: "",

        fileType: req.file.mimetype,

        fileName: req.file.originalname,

        storedFileName: req.file.filename,

        filePath: req.file.path,

        fileSize: req.file.size,

        expiryDate: expiryDate || undefined,

        description: description || "",
      });

      // Authenticated endpoint used by the frontend
      document.fileUrl = `/api/documents/${document._id}/file`;

      await document.save();

      res.status(201).json({
        message: "Document uploaded successfully",
        document,
      });
    } catch (error) {
      console.error("Document upload error:", error);

      // Remove physical file if database creation fails
      if (
        req.file &&
        req.file.path &&
        fs.existsSync(req.file.path)
      ) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (deleteError) {
          console.error(
            "Failed to remove uploaded file:",
            deleteError
          );
        }
      }

      res.status(500).json({
        message: "Failed to upload document",
        error: error.message,
      });
    }
  }
);

/* =========================================================
   DOWNLOAD DOCUMENT
========================================================= */

router.get("/:id/file", auth, async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!document) {
      return res.status(404).json({
        message: "Document not found",
      });
    }

    if (!document.filePath) {
      return res.status(404).json({
        message: "No file is attached to this document",
      });
    }

    if (!fs.existsSync(document.filePath)) {
      return res.status(404).json({
        message: "Stored file could not be found",
      });
    }

    res.setHeader(
      "Content-Type",
      document.fileType || "application/octet-stream"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(
        document.fileName || document.name
      )}"`
    );

    res.sendFile(path.resolve(document.filePath));
  } catch (error) {
    console.error("Download document error:", error);

    res.status(500).json({
      message: "Failed to download document",
      error: error.message,
    });
  }
});

/* =========================================================
   UPDATE DOCUMENT METADATA
========================================================= */

router.patch("/:id", auth, async (req, res) => {
  try {
    const {
      name,
      category,
      expiryDate,
      description,
    } = req.body;

    const document = await Document.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!document) {
      return res.status(404).json({
        message: "Document not found",
      });
    }

    if (name !== undefined) {
      if (!String(name).trim()) {
        return res.status(400).json({
          message: "Document name cannot be empty",
        });
      }

      document.name = String(name).trim();
    }

    if (category !== undefined) {
      if (!String(category).trim()) {
        return res.status(400).json({
          message: "Document category cannot be empty",
        });
      }

      document.category = String(category).trim();
    }

    if (expiryDate !== undefined) {
      document.expiryDate = expiryDate || undefined;
    }

    if (description !== undefined) {
      document.description = String(description);
    }

    await document.save();

    res.json({
      message: "Document updated successfully",
      document,
    });
  } catch (error) {
    console.error("Update document error:", error);

    res.status(500).json({
      message: "Failed to update document",
      error: error.message,
    });
  }
});

/* =========================================================
   DELETE DOCUMENT
========================================================= */

router.delete("/:id", auth, async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!document) {
      return res.status(404).json({
        message: "Document not found",
      });
    }

    // Delete physical file
    if (
      document.filePath &&
      fs.existsSync(document.filePath)
    ) {
      try {
        fs.unlinkSync(document.filePath);
      } catch (fileError) {
        console.error(
          "Failed to delete physical document file:",
          fileError
        );
      }
    }

    await Document.deleteOne({
      _id: document._id,
    });

    res.json({
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error("Delete document error:", error);

    res.status(500).json({
      message: "Failed to delete document",
      error: error.message,
    });
  }
});

/* =========================================================
   MULTER / UPLOAD ERROR HANDLER
========================================================= */

router.use((error, req, res, next) => {
  console.error("Document route error:", error);

  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message: "File size cannot exceed 25 MB",
      });
    }

    return res.status(400).json({
      message: error.message || "File upload error",
    });
  }

  if (
    error.message ===
    "Only PDF, JPG, and PNG files are allowed"
  ) {
    return res.status(400).json({
      message: error.message,
    });
  }

  return res.status(500).json({
    message: error.message || "Document operation failed",
  });
});

module.exports = router;