const express = require('express');
const router = express.Router();
const db = require('../models');

// Helper function to update offer states based on date
const updateOfferStates = async () => {
  const ofertas = await db.tb_ofertas.findAll();
  const today = new Date();
  for (let oferta of ofertas) {
    if (new Date(oferta.fecha_fin) < today) {
      await oferta.update({ estado: false });
    }
  }
};

// Get all ofertas
router.get('/', async (req, res) => {
  try {
    await updateOfferStates();
    const ofertas = await db.tb_ofertas.findAll();
    res.status(200).json(ofertas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get active ofertas
router.get('/active', async (req, res) => {
  try {
    await updateOfferStates();
    const ofertas = await db.tb_ofertas.findAll({ where: { estado: true } });
    if (ofertas && ofertas.length > 0) {
      const ofertasConNegocio = await Promise.all(ofertas.map(async (oferta) => {
        const negocio = await db.tb_negocio.findOne({
          where: { negocio_id: oferta.negocio_id }
        });

        return {
          estado: oferta.estado,
          fechacreacion: oferta.fechacreacion,
          ofertas_id: oferta.ofertas_id,
          descripcion: oferta.descripcion,
          gc_necesarios: oferta.gc_necesarios,
          negocio: negocio.nombre,
          fecha_inicio: oferta.fecha_inicio,
          fecha_fin: oferta.fecha_fin
        };
      }));

      res.status(200).json(ofertasConNegocio);
    } else {
      res.status(404).json({ message: 'No active ofertas found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Inactive ofertas
router.get('/inactive', async (req, res) => {
  try {
    await updateOfferStates();
    const ofertas = await db.tb_ofertas.findAll({ where: { estado: false } });
    if (ofertas && ofertas.length > 0) {
      const ofertasConNegocio = await Promise.all(ofertas.map(async (oferta) => {
        const negocio = await db.tb_negocio.findOne({
          where: { negocio_id: oferta.negocio_id }
        });

        return {
          estado: oferta.estado,
          fechacreacion: oferta.fechacreacion,
          ofertas_id: oferta.ofertas_id,
          descripcion: oferta.descripcion,
          gc_necesarios: oferta.gc_necesarios,
          negocio: negocio.nombre,
          fecha_inicio: oferta.fecha_inicio,
          fecha_fin: oferta.fecha_fin
        };
      }));

      res.status(200).json(ofertasConNegocio);
    } else {
      res.status(404).json({ message: 'No Inactive ofertas found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get active ofertas for a specific negocio
router.get('/active/:negocio_id', async (req, res) => {
  try {
    const negocio_id = req.params.negocio_id;

    // Verificar si el negocio existe
    const negocio = await db.tb_negocio.findOne({ where: { negocio_id } });
    if (!negocio) {
      return res.status(404).json({ message: 'Negocio not found' });
    }

    // Actualizar estados de las ofertas antes de buscar
    await updateOfferStates();

    // Encontrar ofertas activas para el negocio específico
    const ofertas = await db.tb_ofertas.findAll({
      where: {
        estado: true,
        negocio_id: negocio_id
      }
    });

    if (ofertas && ofertas.length > 0) {
      const ofertasConNegocio = ofertas.map(oferta => ({
        estado: oferta.estado,
        fechacreacion: oferta.fechacreacion,
        ofertas_id: oferta.ofertas_id,
        descripcion: oferta.descripcion,
        gc_necesarios: oferta.gc_necesarios,
        negocio: negocio.nombre,
        fecha_inicio: oferta.fecha_inicio,
        fecha_fin: oferta.fecha_fin
      }));

      res.status(200).json(ofertasConNegocio);
    } else {
      res.status(404).json({ message: 'No active ofertas found for this negocio' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
function resetTime(date) {
  date.setHours(0, 0, 0, 0);
  return date;
}
// Create a new oferta
router.post('/', async (req, res) => {
 
  try {
    const { fecha_inicio, fecha_fin } = req.body;
    const today = resetTime(new Date());
    const startDate = resetTime(new Date(fecha_inicio));
    const endDate = resetTime(new Date(fecha_fin));
    console.log(today+'****'+startDate+"+++++"+endDate);
    // Validate fecha_inicio
    if (startDate < today) {
      return res.status(400).json({ message: 'La fecha de inicio debe ser mayor o igual a la fecha actual' });
    }

    // Validate fecha_fin
    const minEndDate = new Date(startDate);
    minEndDate.setDate(minEndDate.getDate() + 7);
    if (endDate < minEndDate) {
      return res.status(400).json({ message: 'La fecha fin debe ser al menos una semana mayor que fecha inicio de la oferta' });
    }
    /*
    const millisecondsInAWeek = 7 * 24 * 60 * 60 * 1000;
    if ((endDate - startDate) < millisecondsInAWeek) {
      return res.status(400).json({ message: 'La fecha fin debe ser al menos una semana mayor que la fecha inicio de la oferta' });
    }
    */
    const oferta = await db.tb_ofertas.create(req.body);
    res.status(201).json(oferta);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Get an oferta by id
router.get('/:id', async (req, res) => {
  try {
    const oferta = await db.tb_ofertas.findByPk(req.params.id);
    if (oferta) {
      res.status(200).json(oferta);
    } else {
      res.status(404).json({ message: 'Oferta no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update an oferta by id
/*
router.put('/:id', async (req, res) => {
  try {
    const oferta = await db.tb_ofertas.findByPk(req.params.id);
    if (oferta) {
      await oferta.update(req.body);
      res.status(200).json(oferta);
    } else {
      res.status(404).json({ message: 'Oferta not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});*/

// Update an oferta by id con validaciones
router.put('/:id', async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.body;
    const today = resetTime(new Date());
    const startDate = resetTime(new Date(fecha_inicio));
    const endDate = resetTime(new Date(fecha_fin));

    // Validate fecha_inicio
    /*if (startDate < today) {
      return res.status(400).json({ message: 'La fecha de inicio debe ser mayor o igual a la fecha actual' });
    }*/
      const minEndDate = new Date(startDate);
      minEndDate.setDate(minEndDate.getDate() + 7);
            console.log(today+'--------'+startDate+" Resta"+(endDate - startDate)+"Min "+minEndDate);

      if (endDate < minEndDate) {
        return res.status(400).json({ message: 'La fecha fin debe ser al menos una semana mayor que fecha inicio de la oferta' });
      }

    // Validación de fecha_fin
      /*const millisecondsInAWeek = 7 * 24 * 60 * 60 * 1000;
      if ((endDate - startDate) < millisecondsInAWeek) {
        return res.status(400).json({ message: 'La fecha fin debe ser al menos una semana mayor que la fecha inicio de la oferta' });
      }*/


    const oferta = await db.tb_ofertas.findByPk(req.params.id);
    if (oferta) {
      await oferta.update(req.body);
      res.status(200).json(oferta);
    } else {
      res.status(404).json({ message: 'Oferta no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Delete an oferta by id
/*
router.delete('/:id', async (req, res) => {
  try {
    const oferta = await db.tb_ofertas.findByPk(req.params.id);
    if (oferta) {
      await oferta.destroy();
      res.status(204).json();
    } else {
      res.status(404).json({ message: 'Oferta not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});*/

// Logical delete an oferta by id
router.delete('/:id', async (req, res) => {
  try {
    const oferta = await db.tb_ofertas.findByPk(req.params.id);
    if (oferta) {
      await oferta.update({ estado: false });
      res.status(200).json({ message: 'Oferta logically deleted' });
    } else {
      res.status(404).json({ message: 'Oferta not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
