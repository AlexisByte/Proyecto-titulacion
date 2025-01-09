const express = require('express');
const router = express.Router();
const db = require('../models');
const multer = require('multer');
const storage = multer.memoryStorage(); // Almacena los archivos en memoria

const upload = multer({ storage: storage });

// Get all negocios
router.get('/', async (req, res) => {
  try {
    const negocios = await db.tb_negocio.findAll();
    const negociosWithBase64Images = negocios.map(negocio => {
      const negocioData = negocio.toJSON();
      if (negocioData.image) {
        negocioData.image = Buffer.from(negocioData.image).toString('base64');
      }
      return negocioData;
    });
    res.status(200).json(negociosWithBase64Images);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/active', async (req, res) => {
  try {
    const negocios = await db.tb_negocio.findAll(
      { where: { estado: true } }
    );
    const negociosWithBase64Images = negocios.map(negocio => {
      const negocioData = negocio.toJSON();
      if (negocioData.image) {
        negocioData.image = Buffer.from(negocioData.image).toString('base64');
      }
      return negocioData;
    });
    res.status(200).json(negociosWithBase64Images);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/inactive', async (req, res) => {
  try {
    const negocios = await db.tb_negocio.findAll(
      { where: { estado: false } }
    );
    const negociosWithBase64Images = negocios.map(negocio => {
      const negocioData = negocio.toJSON();
      if (negocioData.image) {
        negocioData.image = Buffer.from(negocioData.image).toString('base64');
      }
      return negocioData;
    });
    res.status(200).json(negociosWithBase64Images);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
/* Create a new negocio
router.post('/', async (req, res) => {
  try {
    const negocio = await db.tb_negocio.create(req.body);
    res.status(201).json(negocio);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});*/

// Get a negocio by id
router.get('/:id', async (req, res) => {
  try {
    const negocio = await db.tb_negocio.findByPk(req.params.id);
    if (negocio) {
      res.status(200).json(negocio);
    } else {
      res.status(404).json({ message: 'Negocio not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a negocio by id
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const negocio = await db.tb_negocio.findByPk(req.params.id);

    if (!negocio) {
      return res.status(404).json({ message: 'Negocio not found' });
    }

    // Initialize updatedFields object
    const updatedFields = {};

    // Get fields to be updated
    const { nombre, propietario, tipo_negocio, direccion, telefono, fecharegistro } = req.body;
    const image = req.file ? req.file.buffer : null;

    // Update only the fields that are provided in the request
    if (nombre) {
      updatedFields.nombre = nombre.trim();
    }
    if (propietario) {
      updatedFields.propietario = propietario.trim();
    }
    if (tipo_negocio) {
      updatedFields.tipo_negocio = tipo_negocio.trim();
    }
    if (direccion) {
      updatedFields.direccion = direccion.trim();
    }
    if (telefono) {
      updatedFields.telefono = telefono.trim();
    }
    if (fecharegistro) {
      updatedFields.fecharegistro = new Date(fecharegistro);
    }

    // Update the image if a file is provided
    if (image) {
      updatedFields.image = image; // Save the file buffer as the image
    }

    // Update the business with the modified fields
    await negocio.update(updatedFields);

    res.status(200).json({ message: 'Negocio actualizado exitosamente', negocio });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a negocio by id
router.delete('/:id', async (req, res) => {
  try {
    const negocio = await db.tb_negocio.findByPk(req.params.id);
    if (negocio) {
      await negocio.destroy();
      res.status(204).json();
    } else {
      res.status(404).json({ message: 'Negocio not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
