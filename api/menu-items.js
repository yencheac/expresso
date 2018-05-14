const express = require('express');
const menuitemsRouter = express.Router({mergeParams: true});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

menuitemsRouter.param('menuItemId', (req, res, next, menuItemId) => {
  const sql = 'SELECT * FROM MenuItem WHERE id = $menuItemId';
  const values = {$menuItemId: menuItemId};
  db.get(sql, values, (error, menuItem) => {
    if (error) {
      next(error);
    } else if (menuItem) {
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

menuitemsRouter.get('/', (req, res, next) => {
  const sql = 'SELECT * FROM MenuItem WHERE menu_id = $menuId';
  const values = {$menuId: req.params.menuId};
  db.all(sql, values, (error, menuItems) => {
    if (error) {
      next(error);
    } else {
      res.status(200).json({menuItems: menuItems});
    }
  });
});

menuitemsRouter.post('/', (req, res, next) => {
  const name = req.body.menuItem.name,
        description = req.body.menuItem.description,
        inventory = req.body.menuItem.inventory,
        price = req.body.menuItem.price,
        menuId = req.params.menuId;

  if (!name || !description || !inventory || !price) {
    return res.sendStatus(400);
  }

  const sql = 'INSERT INTO MenuItem (name, description, inventory, price, menu_id)' +
              'VALUES ($name, $description, $inventory, $price, $menuId)';
  const values = {
    $name: name,
    $description: description,
    $inventory: inventory,
    $price: price,
    $menuId: menuId
  };
  db.run(sql, values, function(error) {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM MenuItem WHERE id = ${this.lastID}`,
      (error, menuItem) => {
        res.status(201).json({menuItem: menuItem});
      });
    }
  })
});

menuitemsRouter.put('/:menuItemId', (req, res, next) => {
  const name = req.body.menuItem.name,
        description = req.body.menuItem.description,
        inventory = req.body.menuItem.inventory,
        price = req.body.menuItem.price,
        menuItemId = req.params.menuItemId;

  if (!name || !description || !inventory || !price) {
    return res.sendStatus(400);
  }

  const sql = 'UPDATE MenuItem SET name=$name, description=$description, inventory=$inventory,' +
              'price=$price WHERE id=$menuItemId';
  const values = {
    $name: name,
    $description: description,
    $inventory: inventory,
    $price: price,
    $menuItemId: menuItemId
  };

  db.run(sql, values, error => {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM MenuItem WHERE id = ${menuItemId}`,
      (error, menuItem) => {
        res.status(200).send({menuItem: menuItem});
      });
    }
  });
});

menuitemsRouter.delete('/:menuItemId', (req, res, next) => {
  const sql = 'DELETE FROM MenuItem WHERE id = $menuItemId';
  const values = {$menuItemId: req.params.menuItemId};

  db.run(sql, values, error => {
    if (error) {
      next(error);
    } else {
      res.sendStatus(204);
    }
  });
});

module.exports = menuitemsRouter;
