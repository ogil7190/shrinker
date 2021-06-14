const express = require("express");

function getRouter() {
  const router = express.Router();

  router.get("/test", (req, res) => {
    res.json({
      success: true,
    });
  });

  return router;
}

module.exports = {
  getRouter,
};
