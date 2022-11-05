const express = require("express");
const router = express.Router();

/**middleware por aki se monitorea el acceso a la ruta admin */
router.use("/admin/", (peticion, respuesta, siguiente) => {
  if (!peticion.session.usuario) {
    peticion.flash("mensaje", "Debe iniciar sesión");
    respuesta.redirect("/inicio");
  } else {
    siguiente();
  }
});

module.exports = router;
