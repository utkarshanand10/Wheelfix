const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const sharp = require('sharp');
const AuditLog = require('../models/auditLogModel');
const { validationResult } = require('express-validator');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../public/uploads');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|svg/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: fileFilter
});

// Middleware for handling file uploads
const uploadMiddleware = upload.single('image');

// Process and resize image
const processImage = async (filePath, filename) => {
  try {
    const baseName = path.parse(filename).name;
    const ext = path.parse(filename).ext;
    const dir = path.dirname(filePath);

    // Create different sizes
    const sizes = [
      { name: 'thumbnail', width: 150, height: 150 },
      { name: 'small', width: 300, height: 300 },
      { name: 'medium', width: 600, height: 600 },
      { name: 'large', width: 1200, height: 1200 }
    ];

    const processedImages = {};

    for (const size of sizes) {
      const outputPath = path.join(dir, `${baseName}_${size.name}${ext}`);
      
      await sharp(filePath)
        .resize(size.width, size.height, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 85 })
        .toFile(outputPath);

      processedImages[size.name] = `/uploads/${path.basename(outputPath)}`;
    }

    // Keep original
    processedImages.original = `/uploads/${filename}`;

    return processedImages;
  } catch (error) {
    console.error('Image processing error:', error);
    throw error;
  }
};

// Upload single image
const uploadImage = async (req, res) => {
  try {
    uploadMiddleware(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      try {
        // Process image to create different sizes
        const processedImages = await processImage(req.file.path, req.file.filename);

        // Log activity
        await AuditLog.logActivity({
          actorId: req.user._id,
          actorEmail: req.user.email,
          actorRole: req.user.role,
          action: 'file_upload',
          entity: 'media',
          entityId: req.file.filename,
          entityTitle: req.file.originalname,
          metadata: {
            filename: req.file.filename,
            originalName: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype,
            processedSizes: Object.keys(processedImages)
          },
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          sessionId: req.sessionID,
          severity: 'low'
        });

        res.json({
          success: true,
          message: 'Image uploaded successfully',
          data: {
            filename: req.file.filename,
            originalName: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype,
            url: processedImages.original,
            sizes: processedImages
          }
        });

      } catch (processError) {
        // Clean up uploaded file if processing fails
        try {
          await fs.unlink(req.file.path);
        } catch (unlinkError) {
          console.error('Failed to delete uploaded file:', unlinkError);
        }

        return res.status(500).json({
          success: false,
          message: 'Failed to process image'
        });
      }
    });
  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image'
    });
  }
};

// Upload multiple images
const uploadMultipleImages = async (req, res) => {
  try {
    const uploadMultiple = upload.array('images', 10); // Max 10 files

    uploadMultiple(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded'
        });
      }

      try {
        const uploadedImages = [];

        for (const file of req.files) {
          const processedImages = await processImage(file.path, file.filename);
          
          uploadedImages.push({
            filename: file.filename,
            originalName: file.originalname,
            size: file.size,
            mimetype: file.mimetype,
            url: processedImages.original,
            sizes: processedImages
          });
        }

        // Log activity
        await AuditLog.logActivity({
          actorId: req.user._id,
          actorEmail: req.user.email,
          actorRole: req.user.role,
          action: 'file_upload',
          entity: 'media',
          entityId: 'multiple',
          entityTitle: 'Multiple Images',
          metadata: {
            fileCount: req.files.length,
            totalSize: req.files.reduce((sum, file) => sum + file.size, 0),
            filenames: req.files.map(file => file.filename)
          },
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          sessionId: req.sessionID,
          severity: 'low'
        });

        res.json({
          success: true,
          message: `${req.files.length} images uploaded successfully`,
          data: { images: uploadedImages }
        });

      } catch (processError) {
        // Clean up uploaded files if processing fails
        for (const file of req.files) {
          try {
            await fs.unlink(file.path);
          } catch (unlinkError) {
            console.error('Failed to delete uploaded file:', unlinkError);
          }
        }

        return res.status(500).json({
          success: false,
          message: 'Failed to process images'
        });
      }
    });
  } catch (error) {
    console.error('Upload multiple images error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload images'
    });
  }
};

// Get media files
const getMedia = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      type,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const uploadsDir = path.join(__dirname, '../public/uploads');
    
    try {
      const files = await fs.readdir(uploadsDir);
      
      // Filter files based on search and type
      let filteredFiles = files.filter(file => {
        const ext = path.extname(file).toLowerCase();
        const isImage = /\.(jpeg|jpg|png|gif|webp|svg)$/.test(ext);
        
        if (type === 'images' && !isImage) return false;
        if (search && !file.toLowerCase().includes(search.toLowerCase())) return false;
        
        return true;
      });

      // Sort files
      filteredFiles.sort((a, b) => {
        const aPath = path.join(uploadsDir, a);
        const bPath = path.join(uploadsDir, b);
        
        if (sortBy === 'name') {
          return sortOrder === 'desc' ? b.localeCompare(a) : a.localeCompare(b);
        } else if (sortBy === 'size') {
          // This would require stat calls, simplified for now
          return 0;
        } else {
          // Default to date sorting
          return 0;
        }
      });

      // Pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedFiles = filteredFiles.slice(startIndex, endIndex);

      // Get file stats
      const filesWithStats = await Promise.all(
        paginatedFiles.map(async (file) => {
          const filePath = path.join(uploadsDir, file);
          const stats = await fs.stat(filePath);
          
          return {
            filename: file,
            url: `/uploads/${file}`,
            size: stats.size,
            createdAt: stats.birthtime,
            modifiedAt: stats.mtime,
            isDirectory: stats.isDirectory()
          };
        })
      );

      // Log activity
      await AuditLog.logActivity({
        actorId: req.user._id,
        actorEmail: req.user.email,
        actorRole: req.user.role,
        action: 'read',
        entity: 'media',
        entityId: 'list',
        entityTitle: 'Media Files',
        metadata: {
          filters: { search, type },
          pagination: { page, limit },
          total: filteredFiles.length
        },
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        sessionId: req.sessionID,
        severity: 'low'
      });

      res.json({
        success: true,
        data: {
          files: filesWithStats,
          pagination: {
            current: parseInt(page),
            pages: Math.ceil(filteredFiles.length / limit),
            total: filteredFiles.length,
            limit: parseInt(limit)
          }
        }
      });

    } catch (dirError) {
      // Uploads directory doesn't exist
      res.json({
        success: true,
        data: {
          files: [],
          pagination: {
            current: 1,
            pages: 0,
            total: 0,
            limit: parseInt(limit)
          }
        }
      });
    }

  } catch (error) {
    console.error('Get media error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch media files'
    });
  }
};

// Delete media file
const deleteMedia = async (req, res) => {
  try {
    const { filename } = req.params;

    if (!filename) {
      return res.status(400).json({
        success: false,
        message: 'Filename is required'
      });
    }

    const uploadsDir = path.join(__dirname, '../public/uploads');
    const filePath = path.join(uploadsDir, filename);

    try {
      // Check if file exists
      await fs.access(filePath);

      // Delete the file
      await fs.unlink(filePath);

      // Also delete any processed versions
      const baseName = path.parse(filename).name;
      const ext = path.parse(filename).ext;
      const sizes = ['thumbnail', 'small', 'medium', 'large'];

      for (const size of sizes) {
        const processedPath = path.join(uploadsDir, `${baseName}_${size}${ext}`);
        try {
          await fs.unlink(processedPath);
        } catch (unlinkError) {
          // Ignore if processed file doesn't exist
        }
      }

      // Log activity
      await AuditLog.logActivity({
        actorId: req.user._id,
        actorEmail: req.user.email,
        actorRole: req.user.role,
        action: 'file_delete',
        entity: 'media',
        entityId: filename,
        entityTitle: filename,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        sessionId: req.sessionID,
        severity: 'medium'
      });

      res.json({
        success: true,
        message: 'File deleted successfully'
      });

    } catch (accessError) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

  } catch (error) {
    console.error('Delete media error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete file'
    });
  }
};

// Get media statistics
const getMediaStats = async (req, res) => {
  try {
    const uploadsDir = path.join(__dirname, '../public/uploads');
    
    try {
      const files = await fs.readdir(uploadsDir);
      
      let totalSize = 0;
      let imageCount = 0;
      let otherCount = 0;
      const fileTypes = {};

      for (const file of files) {
        const filePath = path.join(uploadsDir, file);
        const stats = await fs.stat(filePath);
        
        if (stats.isFile()) {
          totalSize += stats.size;
          
          const ext = path.extname(file).toLowerCase();
          if (/\.(jpeg|jpg|png|gif|webp|svg)$/.test(ext)) {
            imageCount++;
          } else {
            otherCount++;
          }

          fileTypes[ext] = (fileTypes[ext] || 0) + 1;
        }
      }

      // Log activity
      await AuditLog.logActivity({
        actorId: req.user._id,
        actorEmail: req.user.email,
        actorRole: req.user.role,
        action: 'read',
        entity: 'media',
        entityId: 'stats',
        entityTitle: 'Media Statistics',
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        sessionId: req.sessionID,
        severity: 'low'
      });

      res.json({
        success: true,
        data: {
          totalFiles: files.length,
          totalSize,
          imageCount,
          otherCount,
          fileTypes,
          averageSize: files.length > 0 ? Math.round(totalSize / files.length) : 0
        }
      });

    } catch (dirError) {
      res.json({
        success: true,
        data: {
          totalFiles: 0,
          totalSize: 0,
          imageCount: 0,
          otherCount: 0,
          fileTypes: {},
          averageSize: 0
        }
      });
    }

  } catch (error) {
    console.error('Get media stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch media statistics'
    });
  }
};

module.exports = {
  uploadImage,
  uploadMultipleImages,
  getMedia,
  deleteMedia,
  getMediaStats
};
